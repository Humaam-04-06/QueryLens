import { QueryDialect } from './index';

export interface HistoryItem {
  id: string;
  query: string;
  dialect: QueryDialect;
  catalogId: string;
  timestamp: number; // Epoch milliseconds
  costScore: number; // 0 - 100
  healthScore: number; // 0 - 100
  issueCount: number;
  criticalIssueCount: number;
  isBookmarked: boolean;
  title?: string;
  tags?: string[];
  executionTimeMs?: number;
}

export type HistoryFilterMode = 'all' | 'bookmarked';
