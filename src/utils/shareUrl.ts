import { QueryDialect } from '../types';

export interface SharedQueryState {
  sql: string;
  dialect: QueryDialect;
  schemaId?: string;
}

/**
 * Creates a permalink with query, dialect, and schema encoded in the hash fragment.
 */
export function createShareableUrl(sql: string, dialect: QueryDialect, schemaId?: string): string {
  const params = new URLSearchParams();
  params.set('sql', btoa(encodeURIComponent(sql)));
  params.set('dialect', dialect);
  if (schemaId) params.set('schema', schemaId);

  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#${params.toString()}`;
}

/**
 * Reads and parses shared query params from the current URL hash.
 */
export function parseShareableUrl(): SharedQueryState | null {
  try {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return null;

    const params = new URLSearchParams(hash);
    const encodedSql = params.get('sql');
    const dialect = params.get('dialect') as QueryDialect;
    const schemaId = params.get('schema') || undefined;

    if (!encodedSql) return null;

    const sql = decodeURIComponent(atob(encodedSql));
    return {
      sql,
      dialect: dialect || 'postgresql',
      schemaId,
    };
  } catch (err) {
    console.error('Failed to parse shareable URL:', err);
    return null;
  }
}

/**
 * Copies the shareable permalink to the user's clipboard and updates browser hash.
 */
export async function copyShareUrl(
  sql: string,
  dialect: QueryDialect,
  schemaId?: string
): Promise<string> {
  const url = createShareableUrl(sql, dialect, schemaId);
  try {
    await navigator.clipboard.writeText(url);
    window.history.replaceState(null, '', url);
    return url;
  } catch {
    // Fallback if clipboard API restricted
    window.history.replaceState(null, '', url);
    return url;
  }
}
