import { HistoryItem } from '../types';

const STORAGE_KEY = 'querylens_query_history_v1';
const MAX_HISTORY_ITEMS = 60;
const EVENT_NAME = 'querylens:history-updated';

/**
 * Retrieve the full list of query history items from LocalStorage
 */
export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to read query history from localStorage:', err);
    return [];
  }
}

/**
 * Save or update a query history record.
 * Deduplicates consecutive executions of the same query.
 */
export function saveHistoryItem(
  entry: Omit<HistoryItem, 'id' | 'timestamp' | 'isBookmarked'> & { isBookmarked?: boolean }
): HistoryItem {
  const current = getHistory();
  const normalizedQuery = entry.query.trim();

  // Check if this exact query and dialect was run recently (within top 5 items)
  const existingIndex = current.findIndex(
    (item) => item.query.trim() === normalizedQuery && item.dialect === entry.dialect
  );

  let updatedItem: HistoryItem;

  if (existingIndex >= 0) {
    // Update existing entry with fresh metrics and move to top
    const existing = current[existingIndex];
    updatedItem = {
      ...existing,
      costScore: entry.costScore,
      healthScore: entry.healthScore,
      issueCount: entry.issueCount,
      criticalIssueCount: entry.criticalIssueCount,
      timestamp: Date.now(),
      catalogId: entry.catalogId,
      executionTimeMs: entry.executionTimeMs ?? existing.executionTimeMs,
      isBookmarked: entry.isBookmarked ?? existing.isBookmarked,
    };
    // Remove from old position and prepend
    current.splice(existingIndex, 1);
    current.unshift(updatedItem);
  } else {
    // Generate new entry
    const id = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    updatedItem = {
      id,
      query: normalizedQuery,
      dialect: entry.dialect,
      catalogId: entry.catalogId,
      timestamp: Date.now(),
      costScore: entry.costScore,
      healthScore: entry.healthScore,
      issueCount: entry.issueCount,
      criticalIssueCount: entry.criticalIssueCount,
      isBookmarked: entry.isBookmarked ?? false,
      title: entry.title,
      tags: entry.tags,
      executionTimeMs: entry.executionTimeMs,
    };
    current.unshift(updatedItem);
  }

  // Prune history to limit, prioritizing preserving bookmarked items
  if (current.length > MAX_HISTORY_ITEMS) {
    const bookmarked = current.filter((i) => i.isBookmarked);
    const unbookmarked = current.filter((i) => !i.isBookmarked);
    const maxUnbookmarked = MAX_HISTORY_ITEMS - bookmarked.length;
    const pruned = [...bookmarked, ...unbookmarked.slice(0, Math.max(10, maxUnbookmarked))];
    // Sort descending by timestamp
    pruned.sort((a, b) => b.timestamp - a.timestamp);
    persistHistory(pruned);
  } else {
    persistHistory(current);
  }

  notifySubscribers();
  return updatedItem;
}

/**
 * Toggle bookmark status for a given history record
 */
export function toggleBookmark(id: string): boolean {
  const current = getHistory();
  const item = current.find((i) => i.id === id);
  if (!item) return false;

  item.isBookmarked = !item.isBookmarked;
  persistHistory(current);
  notifySubscribers();
  return item.isBookmarked;
}

/**
 * Delete a specific history entry
 */
export function deleteHistoryItem(id: string): void {
  const current = getHistory();
  const filtered = current.filter((i) => i.id !== id);
  persistHistory(filtered);
  notifySubscribers();
}

/**
 * Clear all unbookmarked history records, or everything if preserveBookmarks is false
 */
export function clearHistory(preserveBookmarks = true): void {
  if (preserveBookmarks) {
    const current = getHistory();
    const bookmarkedOnly = current.filter((i) => i.isBookmarked);
    persistHistory(bookmarkedOnly);
  } else {
    persistHistory([]);
  }
  notifySubscribers();
}

/**
 * Update the title/note of a history item
 */
export function updateHistoryItemTitle(id: string, title: string): void {
  const current = getHistory();
  const item = current.find((i) => i.id === id);
  if (item) {
    item.title = title.trim();
    persistHistory(current);
    notifySubscribers();
  }
}

/**
 * Subscribe to storage updates from anywhere in the React app
 */
export function subscribeToHistory(callback: (items: HistoryItem[]) => void): () => void {
  const handler = () => {
    callback(getHistory());
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

// Internal helpers
function persistHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to write query history to localStorage:', err);
  }
}

function notifySubscribers(): void {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}
