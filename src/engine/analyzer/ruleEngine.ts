import { AnalysisIssue, AnalysisResult, QueryDialect, SchemaCatalog } from '../../types';
import { parseSqlQuery } from '../ast/parser';

export function analyzeQuery(
  sql: string,
  dialect: QueryDialect,
  schema: SchemaCatalog
): AnalysisResult {
  const parsed = parseSqlQuery(sql, dialect);
  const issues: AnalysisIssue[] = [];

  let cpuPressure = 20;
  let ioPressure = 25;
  let memPressure = 15;

  // Rule 1: SELECT * detected
  if (parsed.hasSelectStar) {
    issues.push({
      id: 'select-star',
      title: 'SELECT * detected',
      severity: 'warning',
      description: 'Projecting all columns creates unnecessary I/O overhead, prevents covering index utilization, and wastes database buffer cache.',
      remediation: 'Replace wildcard (*) with explicit column names required by the client application.',
    });
    ioPressure += 25;
    memPressure += 20;
  }

  // Rule 2: Unindexed filter columns & Large Table Scan
  parsed.whereConditions.forEach((cond) => {
    if (cond.column) {
      const parts = cond.column.split('.');
      const colName = parts.length > 1 ? parts[1] : parts[0];
      const tableName = parts.length > 1 ? parts[0] : parsed.tables[0];

      const tableDef = schema.tables.find(
        (t) => t.name.toLowerCase() === (tableName || '').toLowerCase()
      );

      if (tableDef) {
        // Check existing indexes
        const hasIndex = tableDef.existingIndexes.some((idx) =>
          idx.toLowerCase().includes(colName.toLowerCase())
        );

        if (!hasIndex && colName.toLowerCase() !== 'id') {
          issues.push({
            id: `missing-index-${tableName}-${colName}`,
            title: `Missing index: ${tableName}.${colName}`,
            severity: 'critical',
            table: tableName,
            column: colName,
            description: `Filtering by ${tableName}.${colName} without a secondary B-Tree index forces the database engine to inspect all ~${tableDef.rowCount.toLocaleString()} rows sequentially.`,
            remediation: `Create a B-Tree index on ${tableName}(${colName}) to reduce lookup time from O(N) to O(log N).`,
          });
          ioPressure += 40;
          cpuPressure += 35;

          if (tableDef.rowCount > 5000) {
            issues.push({
              id: `large-table-scan-${tableName}`,
              title: 'Large table scan detected',
              severity: 'critical',
              table: tableName,
              description: `Sequential scan on ${tableName} (~${tableDef.rowCount.toLocaleString()} rows) causes high disk read latency and potential table lock contention.`,
              remediation: `Index the predicate column or apply pagination/partitioning.`,
            });
            ioPressure += 20;
          }
        }
      }
    }

    // Rule 3: Leading wildcard search
    if (cond.operator === 'LIKE' && cond.value && /^['"]%/.test(cond.value)) {
      issues.push({
        id: 'leading-wildcard-like',
        title: 'Leading wildcard in LIKE clause (%...)',
        severity: 'warning',
        description: 'B-Tree indexes cannot be used for pattern matches that begin with a wildcard (e.g. LIKE "%val").',
        remediation: 'Use full-text search (GIN/GiST index) or trailing wildcards only (LIKE "val%").',
      });
      cpuPressure += 30;
      ioPressure += 30;
    }
  });

  // Rule 4: Cartesian Product / Cross Join
  if (parsed.hasCartesianProduct) {
    issues.push({
      id: 'cartesian-join',
      title: 'Cartesian product detected',
      severity: 'critical',
      description: 'Tables joined without explicit ON or WHERE equality conditions will produce an N × M row explosion.',
      remediation: 'Specify explicit INNER JOIN ... ON keys between joined tables.',
    });
    cpuPressure = 95;
    ioPressure = 95;
    memPressure = 90;
  }

  // Cap pressures at 100
  cpuPressure = Math.min(100, cpuPressure);
  ioPressure = Math.min(100, ioPressure);
  memPressure = Math.min(100, memPressure);

  // Compute overall estimated cost & health score
  let estimatedCost = Math.round((cpuPressure * 0.4) + (ioPressure * 0.45) + (memPressure * 0.15));
  if (issues.length === 0) {
    estimatedCost = 12;
  }
  const score = Math.max(5, 100 - estimatedCost);

  return {
    rawSql: sql,
    dialect,
    estimatedCost,
    score,
    issues,
    resourcePressure: {
      cpu: cpuPressure,
      io: ioPressure,
      memory: memPressure,
    },
    scannedTables: parsed.tables,
    projectedColumns: parsed.columns,
    hasCartesianProduct: parsed.hasCartesianProduct,
    hasSelectStar: parsed.hasSelectStar,
  };
}
