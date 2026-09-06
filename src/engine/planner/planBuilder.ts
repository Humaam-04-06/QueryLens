import { AnalysisResult, ExecutionPlanNode, SchemaCatalog } from '../../types';
import { parseSqlQuery } from '../ast/parser';

export function buildExecutionPlan(
  analysis: AnalysisResult,
  schema: SchemaCatalog,
  isOptimized: boolean = false
): ExecutionPlanNode {
  const parsed = parseSqlQuery(analysis.rawSql, analysis.dialect);
  const primaryTable = parsed.tables[0]?.name || 'Orders';
  const joinedTable = parsed.tables[1]?.name || 'Customers';

  const t1Def = schema.tables.find(t => t.name.toLowerCase() === primaryTable.toLowerCase());
  const t2Def = schema.tables.find(t => t.name.toLowerCase() === joinedTable.toLowerCase());

  const t1Rows = t1Def?.rowCount || 50000;
  const t2Rows = t2Def?.rowCount || 10000;

  // Filter predicate column detection
  const filterCond = parsed.whereConditions[0];
  const filterCol = filterCond?.column || 'Country';
  const filterVal = filterCond?.value || "'Pakistan'";

  // 1. Cartesian Product Case
  if (parsed.hasCartesianProduct && parsed.tables.length >= 2) {
    return {
      id: 'cartesian-root',
      label: 'Result Output (Explosive)',
      operator: 'Output',
      cost: 98,
      estimatedRows: t1Rows * t2Rows,
      complexity: 'O(N × M)',
      details: 'Unrestricted Cartesian product produces uncontrolled row multiplication.',
      children: [
        {
          id: 'nested-loop-cartesian',
          label: 'Nested Loop (Cross Product)',
          operator: 'Nested Loop',
          cost: 95,
          estimatedRows: t1Rows * t2Rows,
          complexity: 'O(N × M)',
          isBottleneck: true,
          details: `Executing nested loop cross join between ${primaryTable} (${t1Rows.toLocaleString()} rows) and ${joinedTable} (${t2Rows.toLocaleString()} rows). Total combinations: ${(t1Rows * t2Rows).toLocaleString()}.`,
          recommendation: 'Add explicit ON clause with indexed foreign keys.',
          children: [
            {
              id: 'seq-scan-t1',
              label: `Seq Scan on ${primaryTable}`,
              operator: 'Seq Scan',
              cost: 65,
              estimatedRows: t1Rows,
              complexity: 'O(N)',
              table: primaryTable,
            },
            {
              id: 'seq-scan-t2',
              label: `Seq Scan on ${joinedTable}`,
              operator: 'Seq Scan',
              cost: 55,
              estimatedRows: t2Rows,
              complexity: 'O(N)',
              table: joinedTable,
            },
          ],
        },
      ],
    };
  }

  // 2. Optimized Execution Plan (Post Index Creation)
  if (isOptimized) {
    const projectedRows = 420;
    return {
      id: 'root-out-opt',
      label: 'Result Output (Streaming)',
      operator: 'Output',
      cost: 15,
      estimatedRows: projectedRows,
      outputRows: projectedRows,
      complexity: 'O(1)',
      ioCost: 8,
      cpuCost: 7,
      details: 'Streaming projected columns directly to the network socket with zero disk spooling.',
      children: [
        {
          id: 'hash-join-opt',
          label: 'Hash Join (Indexed Seek)',
          operator: 'Hash Join',
          cost: 12,
          estimatedRows: projectedRows,
          outputRows: projectedRows,
          complexity: 'O(log N)',
          ioCost: 6,
          cpuCost: 6,
          details: `In-memory hash join between filtered ${joinedTable} and primary key indexed ${primaryTable}.`,
          children: [
            {
              id: 'idx-scan-customers',
              label: `Index Scan on ${joinedTable}`,
              operator: 'Index Scan',
              cost: 4,
              estimatedRows: projectedRows,
              outputRows: projectedRows,
              complexity: 'O(log N)',
              table: joinedTable,
              filter: `idx_${joinedTable.toLowerCase()}_${filterCol.toLowerCase()} (${filterCol} = ${filterVal})`,
              details: `B-Tree index seek on idx_${joinedTable.toLowerCase()}_${filterCol.toLowerCase()} directly fetches only the ${projectedRows} qualifying leaf pages.`,
              ioCost: 2,
              cpuCost: 2,
            },
            {
              id: 'idx-seek-orders',
              label: `Index Seek on ${primaryTable}`,
              operator: 'Index Seek',
              cost: 6,
              estimatedRows: projectedRows,
              outputRows: projectedRows,
              complexity: 'O(log N)',
              table: primaryTable,
              filter: `PK_CustomerId (${primaryTable}.CustomerId = ${joinedTable}.Id)`,
              details: `Pointer seeks on ${primaryTable} using clustered primary key index lookup.`,
              ioCost: 3,
              cpuCost: 3,
            },
          ],
        },
      ],
    };
  }

  // 3. Original Unoptimized Execution Plan (Sequential Scans)
  const projectedRows = 420;
  return {
    id: 'root-out-orig',
    label: 'Result Output',
    operator: 'Output',
    cost: 82,
    estimatedRows: projectedRows,
    outputRows: projectedRows,
    complexity: 'O(N)',
    ioCost: 52,
    cpuCost: 30,
    details: 'Spooling unprojected wide tuples across memory buffers and network socket.',
    children: [
      {
        id: 'hash-join-orig',
        label: 'Hash Join (Heavy)',
        operator: 'Hash Join',
        cost: 68,
        estimatedRows: projectedRows,
        outputRows: projectedRows,
        complexity: 'O(N)',
        ioCost: 40,
        cpuCost: 28,
        details: `Building hash table from ${joinedTable} and probing against ${primaryTable} (${t1Rows.toLocaleString()} rows).`,
        children: [
          {
            id: 'seq-scan-customers',
            label: `Seq Scan on ${joinedTable}`,
            operator: 'Seq Scan',
            cost: 48,
            estimatedRows: t2Rows,
            outputRows: projectedRows,
            complexity: 'O(N)',
            table: joinedTable,
            filter: `Filter: (${filterCol} = ${filterVal}) [Sequential Scan across all ${t2Rows.toLocaleString()} rows]`,
            isBottleneck: true,
            ioCost: 36,
            cpuCost: 12,
            details: `CRITICAL BOTTLENECK: Lacking a B-Tree index on ${joinedTable}.${filterCol}, the database engine is forced to read every table page from disk into the buffer pool.`,
            recommendation: `Add index on ${joinedTable}(${filterCol}) to convert this scan to an O(log N) index seek.`,
          },
          {
            id: 'seq-scan-orders',
            label: `Seq Scan on ${primaryTable}`,
            operator: 'Seq Scan',
            cost: 34,
            estimatedRows: t1Rows,
            outputRows: t1Rows,
            complexity: 'O(N)',
            table: primaryTable,
            filter: `Join Filter: (${primaryTable}.CustomerId = ${joinedTable}.Id)`,
            ioCost: 24,
            cpuCost: 10,
            details: `Sequential scan across ${t1Rows.toLocaleString()} records in ${primaryTable}.`,
          },
        ],
      },
    ],
  };
}
