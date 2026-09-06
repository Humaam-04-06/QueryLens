# 🔍 QueryLens - Database Query Optimizer & Visualizer

> Intelligent SQL query static analysis, cost estimation, automated rewrites, index recommendation, and interactive query execution plan visualization.

## 🌟 Overview
QueryLens is an AI and AST-powered SQL optimization workbench that diagnoses query performance bottlenecks before they hit production databases.

## 🚀 Key Highlights
- **AST-Powered SQL Static Analysis**: Detects anti-patterns (`SELECT *`, unindexed predicates, Cartesian products, unindexed JOIN keys, implicit type conversions, wildcard LIKEs, unindexed ORDER BY / GROUP BY).
- **Execution Plan Graph Visualizer**: Interactive node diagram illustrating scans, joins, filters, sorting, and estimated cost bottlenecks with visual heatmaps.
- **Automated Query Rewrites**: Side-by-side SQL diff comparing original vs rewritten optimized queries.
- **Index Recommendations & DDL Generator**: Generates precise `CREATE INDEX` statements with composite index ordering logic.
- **Interactive Sandbox & Mock Schema Engine**: Test queries against pre-loaded eCommerce, Financial, and Analytics schemas or customize your own table catalogs.
