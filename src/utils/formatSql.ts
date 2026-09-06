import { format } from 'sql-formatter';
import { QueryDialect } from '../types';

export function formatSql(sql: string, dialect: QueryDialect = 'postgresql'): string {
  try {
    const dialectMap: Record<QueryDialect, 'postgresql' | 'mysql' | 'sqlite'> = {
      postgresql: 'postgresql',
      mysql: 'mysql',
      sqlite: 'sqlite',
    };
    return format(sql, {
      language: dialectMap[dialect] || 'postgresql',
      tabWidth: 2,
      keywordCase: 'upper',
    });
  } catch {
    return sql;
  }
}
