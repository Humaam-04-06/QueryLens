import { AnalysisIssue, AnalysisResult, QueryDialect, SchemaCatalog } from '../../types';
import { parseSqlQuery } from '../ast/parser';
import { calculateQueryCost } from '../cost/costCalculator';

export function analyzeQuery(
  sql: string,
  dialect: QueryDialect,
  schema: SchemaCatalog
): AnalysisResult {
  const parsed = parseSqlQuery(sql, dialect);
  const issues: AnalysisIssue[] = [];
  let totalScannedRows = 0;

  // Rule 1: SELECT * detected
  if (parsed.hasSelectStar) {
    issues.push({
      id: 'select-star',
      title: 'SELECT * detected',
      severity: 'warning',
      description: 'Projecting all columns creates unnecessary I/O overhead, prevents covering index utilization, and pollutes database buffer memory.',
      remediation: 'Replace wildcard (*) with explicit column names required by your application.',
      impactCategory: 'Network Bandwidth',
      lineReference: 'SELECT *',
    });
  }

  // Calculate table row counts and check unindexed filter predicates
  parsed.tables.forEach((tableRef) => {
    const tableDef = schema.tables.find(
      (t) => t.name.toLowerCase() === tableRef.name.toLowerCase()
    );
    if (tableDef) {
      totalScannedRows += tableDef.rowCount;
    }
  });

  // Rule 2 & 3: Missing index on WHERE conditions & Large Table Scan
  parsed.whereConditions.forEach((cond) => {
    if (cond.column) {
      const colName = cond.column;
      const tableName = cond.table || parsed.tables[0]?.name;

      const tableDef = schema.tables.find(
        (t) => t.name.toLowerCase() === (tableName || '').toLowerCase()
      );

      if (tableDef) {
        // Check if column is covered by existing indexes
        const hasIndex = tableDef.existingIndexes.some((idx) =>
          idx.toLowerCase().includes(colName.toLowerCase())
        );

        if (!hasIndex && colName.toLowerCase() !== 'id') {
          // Missing index detected
          issues.push({
            id: `missing-index-${tableName}-${colName}`,
            title: `Missing index:\n${tableName}.${colName}`,
            severity: 'critical',
            table: tableName,
            column: colName,
            description: `Filtering by ${tableName}.${colName} without a secondary index forces the database engine to inspect all ~${tableDef.rowCount.toLocaleString()} rows sequentially.`,
            remediation: `Create a B-Tree index on ${tableName}(${colName}) to reduce lookup time from O(N) to O(log N).`,
            impactCategory: 'I/O Overhead',
            lineReference: `WHERE ${cond.raw}`,
          });

          // Large table scan risk if table cardinality is high
          if (tableDef.rowCount >= 5000) {
            issues.push({
              id: `large-table-scan-${tableName}`,
              title: 'Large table scan detected',
              severity: 'critical',
              table: tableName,
              description: `Sequential scan on ${tableName} (~${tableDef.rowCount.toLocaleString()} rows) causes high disk read latency, CPU thread saturation, and potential lock contention.`,
              remediation: `Index the predicate column or apply pagination/partitioning to prune table blocks.`,
              impactCategory: 'I/O Overhead',
              lineReference: `FROM ${tableName}`,
            });
          }
        }
      }
    }

    // Rule 4: Non-sargable functions in predicates
    if (cond.isFunctionWrapped && cond.functionName) {
      issues.push({
        id: 'non-sargable-function',
        title: `Non-sargable function: ${cond.functionName}() on ${cond.column}`,
        severity: 'warning',
        table: cond.table,
        column: cond.column,
        description: `Wrapping column ${cond.column} inside ${cond.functionName}() prevents standard B-Tree index traversal, forcing an evaluation for every single row.`,
        remediation: `Rewrite predicate to an indexed range search (e.g. col >= '2024-01-01' AND col < '2025-01-01').`,
        impactCategory: 'CPU Bottleneck',
        lineReference: cond.raw,
      });
    }

    // Rule 5: Leading wildcard in LIKE (%...)
    if (cond.hasLeadingWildcard) {
      issues.push({
        id: 'leading-wildcard-like',
        title: 'Leading wildcard in LIKE clause (%...)',
        severity: 'warning',
        table: cond.table,
        column: cond.column,
        description: `B-Tree indexes cannot be used for pattern matches that begin with a wildcard (e.g. LIKE "%val").`,
        remediation: `Use full-text search (GIN/GiST index) or trailing wildcards only (LIKE "val%").`,
        impactCategory: 'I/O Overhead',
        lineReference: cond.raw,
      });
    }
  });

  // Rule 6: Cartesian product / accidental cross join
  if (parsed.hasCartesianProduct) {
    issues.push({
      id: 'cartesian-join',
      title: 'Cartesian product detected',
      severity: 'critical',
      description: 'Tables joined without explicit ON or WHERE equality conditions will produce an N × M row explosion.',
      remediation: 'Specify explicit INNER JOIN ... ON keys between joined tables.',
      impactCategory: 'Memory / Temp Table',
      lineReference: 'FROM clause',
    });
  }

  // Rule 7: Unindexed ORDER BY / Filesort
  if (parsed.orderByColumns.length > 0 && issues.length > 0) {
    issues.push({
      id: 'unindexed-sort',
      title: `Unindexed ORDER BY sorting (${parsed.orderByColumns.join(', ')})`,
      severity: 'warning',
      description: 'Sorting unindexed result sets forces the engine to buffer and execute an in-memory or on-disk FileSort.',
      remediation: 'Include sorted columns in a composite index after equality filters.',
      impactCategory: 'Memory / Temp Table',
      lineReference: `ORDER BY ${parsed.orderByColumns.join(', ')}`,
    });
  }

  // Cost calculation
  const costResult = calculateQueryCost(issues, totalScannedRows);

  return {
    rawSql: sql,
    dialect,
    estimatedCost: costResult.estimatedCost,
    score: costResult.score,
    issues,
    resourcePressure: costResult.resourcePressure,
    scannedTables: parsed.tables.map((t) => t.name),
    projectedColumns: parsed.columns,
    hasCartesianProduct: parsed.hasCartesianProduct,
    hasSelectStar: parsed.hasSelectStar,
  };
}
