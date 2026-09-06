import { AnalysisResult, ExecutionPlanNode, SchemaCatalog } from '../../types';
import { parseSqlQuery } from '../ast/parser';

export function buildExecutionPlan(
  analysis: AnalysisResult,
  schema: SchemaCatalog,
  isOptimized: boolean = false
): ExecutionPlanNode {
  const parsed = parseSqlQuery(analysis.rawSql, analysis.dialect);
  const primaryTable = parsed.tables[0] || 'Orders';
  const joinedTable = parsed.tables[1] || 'Customers';

  const t1Def = schema.tables.find(t => t.name.toLowerCase() === primaryTable.toLowerCase());
  const t2Def = schema.tables.find(t => t.name.toLowerCase() === joinedTable.toLowerCase());

  const t1Rows = t1Def?.rowCount || 50000;
  const t2Rows = t2Def?.rowCount || 10000;

  if (isOptimized) {
    // Optimized execution plan: uses Index Scan / Index Seek
    return {
      id: 'root-out',
      label: 'Result Output',
      operator: 'Output',
      cost: 15,
      estimatedRows: 420,
      children: [
        {
          id: 'hash-join-opt',
          label: 'Hash Join (Indexed)',
          operator: 'Hash Join',
          cost: 12,
          estimatedRows: 420,
          children: [
            {
              id: 'idx-scan-customers',
              label: `Index Scan on ${joinedTable}`,
              operator: 'Index Scan',
              cost: 4,
              estimatedRows: 420,
              table: joinedTable,
              filter: `idx_${joinedTable.toLowerCase()}_country (Country = 'Pakistan')`,
            },
            {
              id: 'idx-seek-orders',
              label: `Index Seek on ${primaryTable}`,
              operator: 'Index Seek',
              cost: 6,
              estimatedRows: 420,
              table: primaryTable,
              filter: `idx_${primaryTable.toLowerCase()}_custid (Orders.CustomerId = Customers.Id)`,
            },
          ],
        },
      ],
    };
  }

  // Original unoptimized execution plan
  return {
    id: 'root-out',
    label: 'Result Output',
    operator: 'Output',
    cost: 82,
    estimatedRows: 420,
    children: [
      {
        id: 'hash-join-orig',
        label: 'Hash Join',
        operator: 'Hash Join',
        cost: 68,
        estimatedRows: 420,
        children: [
          {
            id: 'seq-scan-customers',
            label: `Seq Scan on ${joinedTable}`,
            operator: 'Seq Scan',
            cost: 48,
            estimatedRows: t2Rows,
            table: joinedTable,
            filter: `Filter: (Country = 'Pakistan') [Seq Scan on ${t2Rows.toLocaleString()} rows]`,
            isBottleneck: true,
          },
          {
            id: 'seq-scan-orders',
            label: `Seq Scan on ${primaryTable}`,
            operator: 'Seq Scan',
            cost: 34,
            estimatedRows: t1Rows,
            table: primaryTable,
            filter: `Orders (CustomerId = Customers.Id)`,
          },
        ],
      },
    ],
  };
}
