import { AnalysisResult, IndexRecommendation, QueryDialect, SchemaCatalog } from '../../types';
import { parseSqlQuery } from '../ast/parser';

export function generateIndexRecommendations(
  analysis: AnalysisResult,
  dialect: QueryDialect,
  schema?: SchemaCatalog
): IndexRecommendation[] {
  const recommendations: IndexRecommendation[] = [];
  const parsed = parseSqlQuery(analysis.rawSql, dialect);

  // Analyze each missing index issue
  analysis.issues.forEach((issue) => {
    if (issue.table && issue.column && issue.id.startsWith('missing-index')) {
      const tableName = issue.table;
      const primaryCol = issue.column;

      const tableDef = schema?.tables.find(
        (t) => t.name.toLowerCase() === tableName.toLowerCase()
      );
      const rowCount = tableDef?.rowCount || 10000;

      // Check if there are other equality or range predicates on this table
      const additionalCols = parsed.whereConditions
        .filter((c) => c.table?.toLowerCase() === tableName.toLowerCase() && c.column && c.column.toLowerCase() !== primaryCol.toLowerCase())
        .map((c) => c.column!);

      // Check if there are ORDER BY columns on this table
      const sortCols = parsed.orderByColumns
        .filter((col) => !col.includes('.') || col.toLowerCase().startsWith(tableName.toLowerCase() + '.'))
        .map((col) => col.includes('.') ? col.split('.')[1] : col)
        .filter((col) => col.toLowerCase() !== primaryCol.toLowerCase());

      const indexCols = [primaryCol, ...additionalCols, ...sortCols];
      const isComposite = indexCols.length > 1;
      const indexType: 'B-TREE' | 'COMPOSITE' | 'COVERING' = isComposite ? 'COMPOSITE' : 'B-TREE';

      const indexName = `idx_${tableName.toLowerCase()}_${indexCols.map((c) => c.toLowerCase()).join('_')}`;

      // Multi-dialect DDL formatting
      let ddl = '';
      const colListStr = indexCols.join(', ');

      switch (dialect) {
        case 'postgresql':
          ddl = `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName}\nON ${tableName} (${colListStr});`;
          break;
        case 'mysql':
          ddl = `CREATE INDEX ${indexName}\nON ${tableName} (${colListStr});`;
          break;
        case 'sqlite':
        default:
          ddl = `CREATE INDEX IF NOT EXISTS ${indexName}\nON ${tableName} (${colListStr});`;
          break;
      }

      const beforeRows = rowCount;
      const afterRows = Math.max(12, Math.round(rowCount * 0.042)); // ~4% selectivity
      const improvementPct = Math.round(((beforeRows - afterRows) / beforeRows) * 100);

      recommendations.push({
        id: `rec-${tableName}-${primaryCol}`,
        table: tableName,
        columns: indexCols,
        type: indexType,
        ddl,
        reason: isComposite
          ? `Composite index on (${colListStr}) optimizes equality filter on ${primaryCol} while eliminating FileSort for downstream operators.`
          : `Eliminates full sequential table scan on ${tableName} by indexing high-selectivity predicate column ${primaryCol}.`,
        estimatedImprovementPct: Math.min(improvementPct, 85),
        isActiveInSimulation: false,
        dialect,
        rowsExaminedReduction: {
          before: beforeRows,
          after: afterRows,
        },
      });
    }
  });

  return recommendations;
}

export function generateAllIndexesDdl(
  recommendations: IndexRecommendation[],
  dialect: QueryDialect
): string {
  if (recommendations.length === 0) return '';
  return recommendations
    .map((rec) => {
      const colList = rec.columns.join(', ');
      const idxName = `idx_${rec.table.toLowerCase()}_${rec.columns.map(c => c.toLowerCase()).join('_')}`;
      if (dialect === 'postgresql') {
        return `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${idxName}\nON ${rec.table} (${colList});`;
      }
      if (dialect === 'mysql') {
        return `CREATE INDEX ${idxName}\nON ${rec.table} (${colList});`;
      }
      return `CREATE INDEX IF NOT EXISTS ${idxName}\nON ${rec.table} (${colList});`;
    })
    .join('\n\n');
}
