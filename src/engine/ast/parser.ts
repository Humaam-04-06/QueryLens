import { Parser } from 'node-sql-parser';
import { QueryDialect } from '../../types';

const parser = new Parser();

export interface ParsedQueryStructure {
  tables: string[];
  columns: string[];
  hasSelectStar: boolean;
  whereConditions: { column?: string; operator?: string; value?: string; raw?: string }[];
  joins: { type: string; table: string; on?: string }[];
  hasCartesianProduct: boolean;
  rawAst: any;
  error?: string;
}

export function parseSqlQuery(sql: string, dialect: QueryDialect = 'postgresql'): ParsedQueryStructure {
  const result: ParsedQueryStructure = {
    tables: [],
    columns: [],
    hasSelectStar: false,
    whereConditions: [],
    joins: [],
    hasCartesianProduct: false,
    rawAst: null,
  };

  const normalizedSql = sql.trim().replace(/;+$/, '');
  if (!normalizedSql) return result;

  // Check for SELECT * via regex fast path
  if (/select\s+\*\s+from/i.test(normalizedSql) || /select\s+.*,\s*\*(\s+|,)/i.test(normalizedSql)) {
    result.hasSelectStar = true;
  }

  // Regex extractions for safety
  const fromMatch = normalizedSql.match(/from\s+([a-zA-Z0-9_]+)/i);
  if (fromMatch) {
    result.tables.push(fromMatch[1]);
  }

  const joinMatches = normalizedSql.matchAll(/(left|right|inner|cross|full)?\s*join\s+([a-zA-Z0-9_]+)\s*(on\s+([^where|group|order|limit]+))?/gi);
  for (const match of joinMatches) {
    const joinTable = match[2];
    if (joinTable && !result.tables.includes(joinTable)) {
      result.tables.push(joinTable);
    }
    result.joins.push({
      type: match[1] || 'INNER',
      table: joinTable,
      on: match[4]?.trim(),
    });
  }

  // Comma joins (Cartesian check)
  const commaFromMatch = normalizedSql.match(/from\s+([a-zA-Z0-9_]+(?:\s*,\s*[a-zA-Z0-9_]+)+)/i);
  if (commaFromMatch) {
    const commaTables = commaFromMatch[1].split(',').map(t => t.trim().split(/\s+/)[0]);
    commaTables.forEach(t => {
      if (!result.tables.includes(t)) result.tables.push(t);
    });
    if (!/where\s+.*=.*(?:\band\b|\bor\b|$)/i.test(normalizedSql)) {
      result.hasCartesianProduct = true;
    }
  }

  // WHERE predicates
  const whereMatch = normalizedSql.match(/where\s+([\s\S]+?)(?:order\s+by|group\s+by|limit|$)/i);
  if (whereMatch) {
    const whereClause = whereMatch[1].trim();
    const parts = whereClause.split(/\s+and\s+|\s+or\s+/i);
    parts.forEach(part => {
      const colMatch = part.match(/([a-zA-Z0-9_.]+)\s*(=|!=|<>|>|<|>=|<=|like|in)\s*(.+)/i);
      if (colMatch) {
        result.whereConditions.push({
          column: colMatch[1].trim(),
          operator: colMatch[2].trim().toUpperCase(),
          value: colMatch[3].trim(),
          raw: part.trim(),
        });
      } else {
        result.whereConditions.push({ raw: part.trim() });
      }
    });
  }

  // AST parser integration
  try {
    const opt = { database: dialect === 'sqlite' ? 'postgresql' : dialect };
    const ast = parser.astify(normalizedSql, opt);
    result.rawAst = ast;
  } catch (err: any) {
    result.error = err.message || 'AST Parser warning';
  }

  return result;
}
