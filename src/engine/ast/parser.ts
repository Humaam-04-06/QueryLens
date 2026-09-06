import { Parser } from 'node-sql-parser';
import { QueryDialect, WhereConditionMeta } from '../../types';

const parser = new Parser();

export interface TableReference {
  name: string;
  alias?: string;
}

export interface JoinReference {
  type: string;
  table: string;
  alias?: string;
  onCondition?: string;
}

export interface ParsedQueryStructure {
  tables: TableReference[];
  columns: string[];
  hasSelectStar: boolean;
  whereConditions: WhereConditionMeta[];
  joins: JoinReference[];
  orderByColumns: string[];
  groupByColumns: string[];
  hasCartesianProduct: boolean;
  aliasMap: Record<string, string>; // alias -> real table name
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
    orderByColumns: [],
    groupByColumns: [],
    hasCartesianProduct: false,
    aliasMap: {},
    rawAst: null,
  };

  const cleanSql = sql.trim().replace(/;+$/, '');
  if (!cleanSql) return result;

  // 1. Detect SELECT *
  if (/select\s+\*\s+from/i.test(cleanSql) || /select\s+.*,\s*\*(\s+|,)/i.test(cleanSql) || /select\s+[a-zA-Z0-9_]+\.\*\s+from/i.test(cleanSql)) {
    result.hasSelectStar = true;
  }

  // 2. Extract primary FROM table and optional alias
  const fromRegex = /from\s+([a-zA-Z0-9_]+)(?:\s+(?:as\s+)?([a-zA-Z0-9_]+))?/i;
  const fromMatch = cleanSql.match(fromRegex);
  if (fromMatch) {
    const tableName = fromMatch[1];
    const alias = fromMatch[2] && !/^(where|join|left|right|inner|outer|cross|group|order|limit)$/i.test(fromMatch[2])
      ? fromMatch[2]
      : undefined;

    result.tables.push({ name: tableName, alias });
    if (alias) {
      result.aliasMap[alias.toLowerCase()] = tableName;
    }
    result.aliasMap[tableName.toLowerCase()] = tableName;
  }

  // 3. Extract JOINs
  const joinRegex = /(left\s+outer|right\s+outer|full\s+outer|inner|cross|left|right)?\s*join\s+([a-zA-Z0-9_]+)(?:\s+(?:as\s+)?([a-zA-Z0-9_]+))?\s*(on\s+([^where|group|order|limit]+))?/gi;
  let match;
  while ((match = joinRegex.exec(cleanSql)) !== null) {
    const joinType = (match[1] || 'INNER').toUpperCase();
    const joinTable = match[2];
    const rawAlias = match[3];
    const alias = rawAlias && !/^(on|where|group|order|limit)$/i.test(rawAlias) ? rawAlias : undefined;
    const onCondition = match[5]?.trim();

    result.tables.push({ name: joinTable, alias });
    if (alias) {
      result.aliasMap[alias.toLowerCase()] = joinTable;
    }
    result.aliasMap[joinTable.toLowerCase()] = joinTable;

    result.joins.push({
      type: joinType,
      table: joinTable,
      alias,
      onCondition,
    });
  }

  // 4. Comma cross-joins
  const commaFromMatch = cleanSql.match(/from\s+([a-zA-Z0-9_]+(?:\s*,\s*[a-zA-Z0-9_]+)+)/i);
  if (commaFromMatch) {
    const rawList = commaFromMatch[1].split(',');
    rawList.forEach((t) => {
      const parts = t.trim().split(/\s+/);
      const tbl = parts[0];
      const als = parts[1];
      if (!result.tables.some((existing) => existing.name.toLowerCase() === tbl.toLowerCase())) {
        result.tables.push({ name: tbl, alias: als });
      }
      if (als) result.aliasMap[als.toLowerCase()] = tbl;
      result.aliasMap[tbl.toLowerCase()] = tbl;
    });

    // Check if WHERE contains join key
    const hasJoinPredicate = /where\s+[\s\S]*?[a-zA-Z0-9_.]+\s*=\s*[a-zA-Z0-9_.]+/i.test(cleanSql);
    if (!hasJoinPredicate) {
      result.hasCartesianProduct = true;
    }
  }

  // 5. WHERE clause decomposition
  const whereMatch = cleanSql.match(/where\s+([\s\S]+?)(?:order\s+by|group\s+by|limit|$)/i);
  if (whereMatch) {
    const whereBlock = whereMatch[1].trim();
    const conditionSplits = whereBlock.split(/\s+and\s+|\s+or\s+/i);

    conditionSplits.forEach((condStr) => {
      const cond = condStr.trim();

      // Check for non-sargable functions: e.g. YEAR(col) = 2024, UPPER(col) = 'ABC', EXTRACT(...) = ...
      const fnMatch = cond.match(/(year|month|day|upper|lower|date|extract|round|abs)\s*\(\s*([a-zA-Z0-9_.]+)[^)]*\)\s*(=|!=|<>|>|<|>=|<=|like|in)\s*(.+)/i);
      if (fnMatch) {
        const fnName = fnMatch[1].toUpperCase();
        const rawCol = fnMatch[2].trim();
        const op = fnMatch[3].toUpperCase();
        const val = fnMatch[4].trim();

        let table: string | undefined;
        let column: string = rawCol;

        if (rawCol.includes('.')) {
          const parts = rawCol.split('.');
          const prefix = parts[0];
          column = parts[1];
          table = result.aliasMap[prefix.toLowerCase()] || prefix;
        } else if (result.tables.length > 0) {
          table = result.tables[0].name;
        }

        result.whereConditions.push({
          raw: cond,
          column,
          table,
          operator: op,
          value: val,
          isFunctionWrapped: true,
          functionName: fnName,
        });
        return;
      }

      // Standard binary comparison: Table.Col = 'Pakistan' or Col LIKE '%term'
      const binaryMatch = cond.match(/([a-zA-Z0-9_.]+)\s*(=|!=|<>|>|<|>=|<=|like|ilike|in)\s*(.+)/i);
      if (binaryMatch) {
        const rawCol = binaryMatch[1].trim();
        const op = binaryMatch[2].trim().toUpperCase();
        const val = binaryMatch[3].trim();
        const hasLeadingWildcard = (op === 'LIKE' || op === 'ILIKE') && /^['"]%/.test(val);

        let table: string | undefined;
        let column: string = rawCol;

        if (rawCol.includes('.')) {
          const parts = rawCol.split('.');
          const prefix = parts[0];
          column = parts[1];
          table = result.aliasMap[prefix.toLowerCase()] || prefix;
        } else if (result.tables.length > 0) {
          table = result.tables[0].name;
        }

        result.whereConditions.push({
          raw: cond,
          column,
          table,
          operator: op,
          value: val,
          hasLeadingWildcard,
        });
        return;
      }

      result.whereConditions.push({ raw: cond });
    });
  }

  // 6. ORDER BY and GROUP BY extraction
  const orderMatch = cleanSql.match(/order\s+by\s+([^limit]+)/i);
  if (orderMatch) {
    result.orderByColumns = orderMatch[1].split(',').map((c) => c.trim());
  }

  const groupMatch = cleanSql.match(/group\s+by\s+([^having|order|limit]+)/i);
  if (groupMatch) {
    result.groupByColumns = groupMatch[1].split(',').map((c) => c.trim());
  }

  // 7. AST parser invocation
  try {
    const opt = { database: dialect === 'sqlite' ? 'postgresql' : dialect };
    const ast = parser.astify(cleanSql, opt);
    result.rawAst = ast;
  } catch (err: any) {
    result.error = err.message || 'AST Parser warning';
  }

  return result;
}
