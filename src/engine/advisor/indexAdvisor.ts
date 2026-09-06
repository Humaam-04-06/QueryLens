import { AnalysisResult, IndexRecommendation, QueryDialect } from '../../types';

export function generateIndexRecommendations(
  analysis: AnalysisResult,
  dialect: QueryDialect
): IndexRecommendation[] {
  const recommendations: IndexRecommendation[] = [];

  analysis.issues.forEach((issue) => {
    if (issue.table && issue.column && issue.id.startsWith('missing-index')) {
      const indexName = `idx_${issue.table.toLowerCase()}_${issue.column.toLowerCase()}`;
      let ddl = '';

      switch (dialect) {
        case 'postgresql':
          ddl = `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName}\nON ${issue.table} (${issue.column});`;
          break;
        case 'mysql':
          ddl = `CREATE INDEX ${indexName}\nON ${issue.table} (${issue.column});`;
          break;
        case 'sqlite':
        default:
          ddl = `CREATE INDEX IF NOT EXISTS ${indexName}\nON ${issue.table} (${issue.column});`;
          break;
      }

      recommendations.push({
        id: `rec-${issue.table}-${issue.column}`,
        table: issue.table,
        columns: [issue.column],
        type: 'B-TREE',
        ddl,
        reason: `Eliminates full table scan on ${issue.table} by indexing the filter predicate (${issue.column}).`,
        estimatedImprovementPct: 75,
        isActiveInSimulation: false,
      });
    }
  });

  return recommendations;
}
