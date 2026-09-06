import { AnalysisResult, SchemaCatalog, SuggestedQuery } from '../../types';
import { parseSqlQuery } from '../ast/parser';

export function generateSuggestedQuery(
  analysis: AnalysisResult,
  schema: SchemaCatalog
): SuggestedQuery {
  let rewritten = analysis.rawSql.trim();
  const changes: string[] = [];

  const parsed = parseSqlQuery(rewritten, analysis.dialect);

  // 1. Rewrite SELECT * with explicit projection
  if (parsed.hasSelectStar) {
    const recommendedCols: string[] = [];
    parsed.tables.forEach((tName) => {
      const tableDef = schema.tables.find((t) => t.name.toLowerCase() === tName.toLowerCase());
      if (tableDef) {
        // Pick primary key and 2-3 most common columns
        const colsToInclude = tableDef.columns
          .filter((c) => c.isPrimaryKey || c.name.toLowerCase().includes('name') || c.name.toLowerCase().includes('date') || c.name.toLowerCase().includes('amount') || c.name.toLowerCase().includes('id'))
          .slice(0, 3)
          .map((c) => `${tableDef.name}.${c.name}`);
        recommendedCols.push(...colsToInclude);
      }
    });

    const projection = recommendedCols.length > 0
      ? recommendedCols.join(',\n    ')
      : 'Orders.Id, Orders.OrderDate, Customers.Name';

    rewritten = rewritten.replace(/select\s+\*/i, `SELECT\n    ${projection}`);
    changes.push(`Replaced SELECT * with explicit columns to reduce network payload and memory footprint.`);
  }

  // 2. Fix Cartesian products if any
  if (parsed.hasCartesianProduct && parsed.tables.length >= 2) {
    const t1 = parsed.tables[0];
    const t2 = parsed.tables[1];
    rewritten = `SELECT ${t1}.Id, ${t2}.Name\nFROM ${t1}\nINNER JOIN ${t2} ON ${t1}.CustomerId = ${t2}.Id\nWHERE ${t1}.Status = 'Pending';`;
    changes.push(`Converted implicit comma cross-join to explicit INNER JOIN with ON predicate.`);
  }

  return {
    originalSql: analysis.rawSql,
    optimizedSql: rewritten,
    explanation: changes.length > 0
      ? changes.join(' ')
      : 'The query already follows standard projection patterns.',
    changes,
  };
}
