import { ColumnDefinition, SchemaCatalog, TableCatalog } from '../../types';

export function parseCustomDdl(ddl: string, catalogName = 'Custom Schema'): SchemaCatalog {
  const tables: TableCatalog[] = [];
  const cleanDdl = ddl.trim();

  // 1. Extract CREATE TABLE statements
  const tableRegex = /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]+?)\);/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(cleanDdl)) !== null) {
    const tableName = tableMatch[1];
    const body = tableMatch[2];

    const columns: ColumnDefinition[] = [];
    const existingIndexes: string[] = [];

    const lines = body.split(',').map(l => l.trim()).filter(Boolean);

    lines.forEach((line) => {
      // Check for inline PRIMARY KEY constraint
      if (/^primary\s+key\s*\(([^)]+)\)/i.test(line)) {
        existingIndexes.push(line);
        const pkCol = line.match(/^primary\s+key\s*\(([^)]+)\)/i)?.[1].trim();
        if (pkCol) {
          const col = columns.find(c => c.name.toLowerCase() === pkCol.toLowerCase());
          if (col) col.isPrimaryKey = true;
        }
        return;
      }

      // Check for inline KEY / INDEX
      if (/^(?:unique\s+)?(?:key|index)\s+/i.test(line)) {
        existingIndexes.push(line);
        return;
      }

      // Parse column line: e.g. Id INT NOT NULL PRIMARY KEY
      const colParts = line.split(/\s+/);
      if (colParts.length >= 2) {
        const colName = colParts[0].replace(/[`"]/g, '');
        const colType = colParts[1];
        const isPk = /primary\s+key/i.test(line);
        const isNullable = !/not\s+null/i.test(line);

        columns.push({
          name: colName,
          type: colType,
          isPrimaryKey: isPk,
          nullable: isNullable,
        });

        if (isPk) {
          existingIndexes.push(`PRIMARY KEY (${colName})`);
        }
      }
    });

    tables.push({
      name: tableName,
      rowCount: 25000, // Default estimated cardinality for custom user tables
      columns,
      existingIndexes,
    });
  }

  // 2. Extract standalone CREATE INDEX statements
  const indexRegex = /create\s+(?:unique\s+)?index\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_]+)\s+on\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\);/gi;
  let idxMatch;

  while ((idxMatch = indexRegex.exec(cleanDdl)) !== null) {
    const idxName = idxMatch[1];
    const targetTable = idxMatch[2];
    const idxCols = idxMatch[3].trim();

    const tbl = tables.find(t => t.name.toLowerCase() === targetTable.toLowerCase());
    if (tbl) {
      tbl.existingIndexes.push(`INDEX ${idxName} (${idxCols})`);
    }
  }

  const catalogId = `custom-${Date.now()}`;

  return {
    id: catalogId,
    name: `${catalogName} (Custom)`,
    description: `User-imported schema with ${tables.length} tables and ${tables.reduce((acc, t) => acc + t.columns.length, 0)} columns`,
    tables,
  };
}
