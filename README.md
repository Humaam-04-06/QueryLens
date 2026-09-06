# 🔍 QueryLens — Database Query Optimizer & Execution Plan Visualizer

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Author](https://img.shields.io/badge/Author-Humaam--04--06-8b5cf6.svg)](https://github.com/Humaam-04-06)

> **QueryLens** is an intelligent SQL query static analysis, cost estimation, automated rewrite, index recommendation, and interactive query execution plan visualization platform. It diagnoses query performance bottlenecks before they hit production databases, providing concrete query rewrites, index recommendations, and visual execution trees.

---

## 🌟 Key Highlights & Features

### 1. 🛡️ AST-Powered SQL Static Analysis Engine
- **Anti-Pattern Diagnostics**: Detects `SELECT *` buffer pollution, missing secondary B-Tree indexes on filtered columns, high-volume sequential table scans, non-sargable function wrappings (e.g. `YEAR(date)`), leading wildcards in `LIKE '%...'`, and accidental Cartesian cross-joins.
- **Resource Pressure Gauges**: Calculates hardware pressure across **CPU compute**, **Disk I/O read throughput**, and **working buffer memory**.
- **Exact Visual Cost Meter**: Features an ASCII block meter (`████████░░ 82%`) and animated glowing progress bar.

### 2. ⚡ Automated Query Rewriter & Side-by-Side Diff
- **Selective Projection Refactoring**: Automatically replaces `SELECT *` with explicit columns derived from the active schema catalog.
- **Sargability Transformations**: Rewrites non-sargable date/math functions into index-friendly range bounds (e.g. `EXTRACT(YEAR FROM OrderDate) = 2024` ➔ `OrderDate >= '2024-01-01' AND OrderDate < '2025-01-01'`).
- **Interactive Diff Viewer**: Offers **Split (Side-by-Side)** and **Unified (Line-by-Line)** diff views with one-click **"Apply to Editor"** and **"Copy SQL"**.

### 3. 💡 Smart Index Advisor & "What-If" Index Simulator
- **Multi-Dialect DDL Generator**: Produces production-grade `CREATE INDEX` statements for **PostgreSQL** (`CONCURRENTLY`), **MySQL**, and **SQLite**.
- **Composite Index Ordering Strategy**: Automatically structures compound keys (Equality first, Range bounds second, and Sort/Group-By third).
- **Interactive "What-If" Simulator**: Toggle recommended indexes on/off and watch the query cost drop from **82% ➔ 18%** in real-time with celebratory confetti bursts (`canvas-confetti`)!

### 4. 📊 Query Execution Plan DAG Visualizer
- **Interactive Operator Tree**: Renders root `Output`, `Hash Join`, `Index Scan`, `Index Seek`, and `Seq Scan` operators.
- **Cost Bottleneck Heatmap**:
  - 🟢 **Emerald**: Low Cost (< 20)
  - 🟡 **Amber**: Moderate Cost (20 - 50)
  - 🔴 **Ruby Red Glow**: Critical Bottleneck (> 50, Sequential Scans)
- **Node Inspector**: Click any operator to inspect algorithmic complexity (`O(1)`, `O(log N)`, `O(N)`), I/O vs CPU cost units, and latency bottlenecks.
- **Before vs After Toggle**: Visually compare the unindexed sequential scan tree with the optimized index seek tree.

### 5. 🚀 Live In-Browser Micro-Benchmarking
- Executes real-time multi-pass benchmarks against high-cardinality synthetic datasets (60,000+ records).
- Measures wall-clock latency (e.g. `44.8 ms` ➔ `1.35 ms`), calculating speedup multipliers (**~34x Faster**) and latency reductions (**~97%**).
- Displays buffer cache hit ratios and memory high-watermarks.

### 6. 📁 Custom Schema DDL Importer & Audit Report Export
- **Custom DDL Ingestion**: Paste any `CREATE TABLE` and `CREATE INDEX` statements to analyze queries against your own proprietary databases.
- **Executive Audit Export**: One-click export of complete Markdown optimization reports detailing anti-patterns, recommended rewrites, index DDLs, and telemetry benchmarks for Pull Requests.

### 7. 🕒 Query History & Starred Performance Bookmarks
- **Session Persistence**: Automatically tracks analyzed queries, cost scores, dialect settings, and relative timestamps via LocalStorage.
- **Starred Bookmarks**: Star critical queries into a dedicated bookmarks tab for regression testing.
- **Instant Query Restoration**: One-click **"Load Query"** button restores queries, dialects, and schema catalogs into the editor.

### 8. 📂 Multi-Query Batch Profiler & SQL File Uploader
- **Native SQL File Ingestion**: Upload `.sql` and `.txt` files directly via drag-and-drop or file picker (up to 5MB) into either the batch profiler or the main SQL editor console.
- **Holistic Workload Health**: Profiles entire database migration scripts, calculating average query costs, cumulative scan volumes, and workload health ratings.
- **Bottleneck Rankings & Consolidation**: Ranks queries by cost risk with one-click workbench inspection and generates unified, deduplicated index recommendations across the whole workload.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Theme** | Tailwind CSS v3, Custom Cyber-Dark Glassmorphism (`dark-950`, neon glows) |
| **Iconography** | FontAwesome Icons (`@fortawesome/react-fontawesome`) |
| **SQL Engine** | AST Visitor, `node-sql-parser`, `sql-formatter` |
| **Benchmarking & Simulation** | In-Browser WebAssembly / synthetic execution runner |
| **Visual Effects** | `canvas-confetti`, animated CSS gradient bars |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Humaam-04-06/QueryLens.git
   cd QueryLens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *(On Windows with PowerShell execution policy restrictions, run: `cmd /c "npm run dev"`)*

4. **Open your browser**:
   Navigate to `http://localhost:5173`.

---

## 🎯 Verification Scenario (User Example)

Enter the target query into the SQL console:
```sql
SELECT *
FROM Orders
JOIN Customers
ON Orders.CustomerId = Customers.Id
WHERE Customers.Country = 'Pakistan';
```

QueryLens instantly diagnoses:
```text
QUERY ANALYSIS
────────────────────

⚠ SELECT * detected

⚠ Missing index:
Customers.Country

⚠ Large table scan detected

Estimated Cost:
████████░░ 82%
```

Then click **"Simulate Index"** or **"Apply to Editor"** to observe:
- Suggested explicit column projection rewrite.
- Generated `CREATE INDEX` DDL with `~82%` cost drop.
- Execution Plan tree transitioning from Sequential Scan to Index Seek.
- Live benchmark demonstrating a **~34x speedup**!

---

## 👤 Author & Contribution

Developed with ❤️ by **[Humaam-04-06](https://github.com/Humaam-04-06)**.  
Repository: **[https://github.com/Humaam-04-06/QueryLens](https://github.com/Humaam-04-06/QueryLens)**
