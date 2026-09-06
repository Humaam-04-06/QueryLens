# 🔍 QueryLens — Database Query Optimizer & Execution Plan Visualizer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-QueryLens%20App-0ea5e9?style=for-the-badge&logo=googlechrome&logoColor=white)](https://humaam-04-06.github.io/QueryLens/)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Deployment](https://img.shields.io/badge/Deployed%20to-GitHub%20Pages-22c55e.svg?logo=github&logoColor=white)](https://humaam-04-06.github.io/QueryLens/)
[![Author](https://img.shields.io/badge/Author-Humaam--04--06-8b5cf6.svg)](https://github.com/Humaam-04-06)

> **QueryLens** is an intelligent SQL query static analysis, cost estimation, automated rewrite, index recommendation, execution plan DAG visualizer, and in-browser benchmarking platform. It identifies and fixes query bottlenecks before they hit production databases.
>
> 🌐 **Live Web Application**: **[https://humaam-04-06.github.io/QueryLens/](https://humaam-04-06.github.io/QueryLens/)**

---

## 📋 Table of Contents

- [🎯 The Target Optimization Scenario](#-the-target-optimization-scenario)
- [🌟 Key Architectural Pillars & Features](#-key-architectural-pillars--features)
  - [1. AST-Powered Static Analysis Engine](#1-️-ast-powered-static-analysis-engine)
  - [2. Automated Query Rewriter & Side-by-Side Diff](#2--automated-query-rewriter--side-by-side-diff)
  - [3. Smart Multi-Dialect Index Advisor & "What-If" Simulator](#3--smart-multi-dialect-index-advisor--what-if-simulator)
  - [4. Query Execution Plan DAG Visualizer](#4--query-execution-plan-dag-visualizer)
  - [5. In-Browser Live SQLite Benchmarking Sandbox](#5--in-browser-live-sqlite-benchmarking-sandbox)
  - [6. Custom Schema DDL Importer & Executive Audit Report Export](#6--custom-schema-ddl-importer--executive-audit-report-export)
  - [7. Query History & Starred Performance Bookmarks](#7--query-history--starred-performance-bookmarks)
  - [8. Multi-Query Batch Profiler & Native SQL File Uploader](#8--multi-query-batch-profiler--native-sql-file-uploader)
  - [9. Multi-Schema Database Catalog Switcher](#9--multi-schema-database-catalog-switcher)
  - [10. Automated CI/CD & Live GitHub Pages Deployment](#10--automated-cicd--live-github-pages-deployment)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 How to Run and Test This Project Locally](#-how-to-run-and-test-this-project-locally)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Start Local Development Server](#3-start-local-development-server)
  - [4. Build for Production](#4-build-for-production)
  - [5. Preview Production Bundle Locally](#5-preview-production-bundle-locally)
  - [6. One-Command Automated Deployment to GitHub Pages](#6-one-command-automated-deployment-to-github-pages)
  - [7. Verify TypeScript Codebase](#7-verify-typescript-codebase)
- [📁 Project Directory Structure](#-project-directory-structure)
- [👤 Author & Acknowledgments](#-author--acknowledgments)

---

## 🎯 The Target Optimization Scenario

When you enter an unoptimized SQL query into QueryLens:

```sql
SELECT *
FROM Orders
JOIN Customers
ON Orders.CustomerId = Customers.Id
WHERE Customers.Country = 'Pakistan';
```

QueryLens instantly performs static AST parsing and evaluates against the active schema catalog, producing the diagnosis:

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

Then QueryLens provides:
1. **Suggested Query**: Replaces `SELECT *` with explicit columns, avoiding buffer cache pollution and heavy network overhead.
2. **Suggested Index**: Generates copyable, production-ready DDL:
   ```sql
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_country
   ON Customers (Country);
   ```
3. **Expected Improvement**: Projects a **~75-85% performance gain** with row scan reduction from 10,000 unindexed rows down to ~420 rows.
4. **"What-If" Simulator**: Toggle the virtual index on and watch the estimated cost drop from **82% ➔ 18%** in real-time with celebratory confetti (`canvas-confetti`)!
5. **Execution Plan DAG Visualizer**: Visualizes the query operator tree transitioning from a ruby-red sequential scan to an emerald index seek.
6. **Live In-Browser Benchmark**: Executes the query against synthetic 60,000+ row datasets in SQLite WebAssembly, verifying a **~34x speedup** (`44.8ms` ➔ `1.35ms`)!

---

## 🌟 Key Architectural Pillars & Features

### 1. 🛡️ AST-Powered Static Analysis Engine
- **Multi-Dialect AST Parsing**: Uses an abstract syntax tree parser supporting **PostgreSQL**, **MySQL**, and **SQLite**.
- **Anti-Pattern Diagnostics**:
  - `SELECT * detected`: Flags full row projection and buffer cache pollution.
  - `Missing index: <Table>.<Column>`: Cross-references WHERE predicates against existing catalog indexes.
  - `Large table scan detected`: Calculates table scan penalty against realistic cardinalities (10k - 1.2M rows).
  - `Non-sargable function detected`: Flags functions wrapping indexed columns (e.g. `YEAR(date)` or `UPPER(email)`).
  - `Cartesian join detected`: Warns against comma joins without matching equality keys.
- **Resource Pressure Meter**: Evaluates CPU compute, Disk I/O throughput, and buffer pool memory consumption.

### 2. ⚡ Automated Query Rewriter & Side-by-Side Diff
- **Selective Column Projections**: Automatically substitutes `SELECT *` with minimal required projected columns inferred from schema.
- **Sargability Transformations**: Rewrites non-sargable date/math functions into index-friendly range bounds (e.g. `EXTRACT(YEAR FROM OrderDate) = 2024` ➔ `OrderDate >= '2024-01-01' AND OrderDate < '2025-01-01'`).
- **Interactive Diff Viewer**: Offers **Split (Side-by-Side)** and **Unified (Line-by-Line)** diff views with one-click **"Apply to Editor"** and **"Copy SQL"**.

### 3. 💡 Smart Multi-Dialect Index Advisor & "What-If" Simulator
- **Multi-Dialect DDL Generator**: Produces production-grade `CREATE INDEX` statements for **PostgreSQL** (`CONCURRENTLY`), **MySQL**, and **SQLite**.
- **Composite Index Ordering Strategy**: Structures compound keys using optimal indexing rules (Equality first, Range bounds second, Sort/Group-By third).
- **Interactive "What-If" Simulator**: Toggle recommended indexes on/off and watch the query cost drop from **82% ➔ 18%** in real-time.

### 4. 📊 Query Execution Plan DAG Visualizer
- **Interactive Operator Tree**: Renders root `Output`, `Hash Join`, `Index Scan`, `Index Seek`, and `Seq Scan` nodes.
- **Cost Bottleneck Heatmap**:
  - 🟢 **Emerald**: Low Cost (< 20)
  - 🟡 **Amber**: Moderate Cost (20 - 50)
  - 🔴 **Ruby Red Glow**: Critical Bottleneck (> 50, Sequential Scans)
- **Node Inspector**: Inspect algorithmic complexity (`O(1)`, `O(log N)`, `O(N)`), I/O vs CPU cost units, and scan latency notes.
- **Before vs After Toggle**: Visually compare the unindexed sequential scan tree with the optimized index seek tree.

### 5. 🚀 In-Browser Live SQLite Benchmarking Sandbox
- Executes real-time multi-pass benchmarks against high-cardinality synthetic datasets (60,000+ records).
- Measures wall-clock execution latency (e.g. `44.8 ms` ➔ `1.35 ms`), calculating speedup multipliers (**~34x Faster**) and latency reductions (**~97%**).
- Displays buffer cache hit ratios and memory high-watermarks.

### 6. 📁 Custom Schema DDL Importer & Executive Audit Report Export
- **Custom Schema Ingestion**: Paste any `CREATE TABLE` and `CREATE INDEX` statements (or click "Load Sample DDL") to analyze queries against proprietary database schemas.
- **Downloadable Markdown Report**: One-click export of an executive performance summary, anti-pattern breakdown, query diff, index DDLs, and telemetry benchmarks ready for Pull Requests.

### 7. 🕒 Query History & Starred Performance Bookmarks
- **Session Persistence**: Automatically tracks executed queries, cost scores, dialect settings, and relative timestamps via LocalStorage.
- **Starred Bookmarks**: Star critical queries into a dedicated bookmarks tab for regression testing.
- **Instant Query Restoration**: One-click **"Load Query"** button restores queries, dialects, and schema catalogs into the editor.

### 8. 📂 Multi-Query Batch Profiler & Native SQL File Uploader
- **Native SQL File Ingestion**: Upload `.sql` and `.txt` files directly via drag-and-drop or file picker (up to 5MB) into either the batch profiler or the main SQL editor console.
- **Holistic Workload Health**: Profiles entire database migration scripts, calculating average query costs, cumulative scan volumes, and workload health ratings.
- **Bottleneck Rankings & Consolidation**: Ranks queries by cost risk with one-click workbench inspection and generates unified, deduplicated index recommendations across the whole workload.

### 9. 🗄️ Multi-Schema Database Catalog Switcher
- Pre-loaded enterprise database catalogs:
  - **E-Commerce (RetailDB)**: Orders (50k rows), Customers (10k rows), OrderItems (150k rows).
  - **FinTech Ledger (FinTechDB)**: Transactions (1.2M rows), Accounts (85k rows), Merchants (14k rows).
  - **SaaS Multi-Tenant (CloudDB)**: Tenants (18k rows), Users (240k rows), Invoices (450k rows), AuditLogs (2.8M rows).
  - **Healthcare Clinic (Custom)**: Patients (25k rows), Appointments (85k rows).

### 10. 🌐 Automated CI/CD & Live GitHub Pages Deployment
- Optimized Vite build with multi-chunk code splitting (`vendor`, `icons`, `sql-parser`, `diagram`).
- One-command automated deployment script (`npm run deploy`) publishing to GitHub Pages at [https://humaam-04-06.github.io/QueryLens/](https://humaam-04-06.github.io/QueryLens/).

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18.3 + TypeScript 5.7 + Vite 6.2** | Blazing fast HMR, strict type safety, zero runtime crashes |
| **Styling & Design System** | **Tailwind CSS v3 + Custom Glassmorphism** | Custom dark cyber palette (`dark-950`, `dark-900`, `dark-850`, neon glowing borders) |
| **Iconography** | **FontAwesome Icons (`@fortawesome/react-fontawesome`)** | Full Developer Icons suite (Solid, Regular, Brands) |
| **SQL Engine & Formatter** | **Custom AST Engine + `node-sql-parser` + `sql-formatter`** | Multi-dialect parsing, tokenization, anti-pattern detection |
| **Execution Plan Visualizer** | **Interactive DAG Canvas (`@xyflow/react`)** | Operator hierarchy DAG, zoom/pan controls, bottleneck heatmaps |
| **Live Benchmarking Runtime** | **`sql.js` (WebAssembly SQLite)** | Zero-backend in-browser live query execution against 60k+ records |
| **Micro-Animations** | **`canvas-confetti` + Animated Progress Bars** | Interactive feedback on index simulation and speedup benchmarks |
| **Storage & Persistence** | **LocalStorage + Custom Event Bus** | Session query history, LRU capacity pruning, starred bookmarks |
| **CI/CD & Hosting** | **GitHub Pages + Node.js ESM Deployer** | Automated deployment pipeline, `.nojekyll`, and SPA route handling |

---

## 🚀 How to Run and Test This Project Locally

Follow these step-by-step instructions to run QueryLens on your machine:

### Prerequisites
Make sure you have the following installed on your computer:
- **Node.js**: Version 18.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: Version 9.0 or higher (comes bundled with Node.js)
- **Git**: Installed and configured ([Download Git](https://git-scm.com/))

Verify your environment by running:
```bash
node -v
npm -v
git --version
```

---

### 1. Clone Repository
Clone the QueryLens repository to your local machine:
```bash
git clone https://github.com/Humaam-04-06/QueryLens.git
cd QueryLens
```

---

### 2. Install Dependencies
Install all project dependencies:
```bash
npm install
```

> [!TIP]
> **Windows PowerShell Execution Policy Note**:  
> If PowerShell throws a script execution policy restriction error (`npm.ps1 cannot be loaded because running scripts is disabled`), run the command with `cmd /c`:
> ```powershell
> cmd /c "npm install"
> ```

---

### 3. Start Local Development Server
Launch the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
*(On Windows PowerShell, run: `cmd /c "npm run dev"`)*

You will see the dev server starting:
```text
  VITE v6.2.0  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to: **`http://localhost:5173`**

---

### 4. Build for Production
To create an optimized, minified production build:
```bash
npm run build
```
*(On Windows PowerShell, run: `cmd /c "npm run build"`)*

The output bundle will be created in the `dist/` directory with code splitting:
- `dist/index.html`
- `dist/assets/vendor-*.js` (React & React DOM)
- `dist/assets/icons-*.js` (FontAwesome icon library)
- `dist/assets/sql-parser-*.js` (AST Engine & SQL Parser)
- `dist/assets/diagram-*.js` (React Flow DAG Visualizer)
- `dist/assets/index-*.css` (Tailwind CSS styles)

---

### 5. Preview Production Bundle Locally
To test the production build locally before deploying:
```bash
npm run preview
```
*(On Windows PowerShell, run: `cmd /c "npm run preview"`)*

---

### 6. One-Command Automated Deployment to GitHub Pages
To build and publish the latest version of QueryLens live to GitHub Pages:
```bash
npm run deploy
```
*(On Windows PowerShell, run: `cmd /c "npm run deploy"`)*

This automated script:
1. Runs `npm run build` with `GITHUB_PAGES=true` to configure the correct base path (`/QueryLens/`).
2. Creates `.nojekyll` and `404.html` fallbacks.
3. Force-pushes the static assets directly to the `gh-pages` branch on GitHub.
4. Your application will be live at: **[https://humaam-04-06.github.io/QueryLens/](https://humaam-04-06.github.io/QueryLens/)**

---

### 7. Verify TypeScript Codebase
To run static type checking without emitting build files:
```bash
npx tsc -b
```
*(On Windows PowerShell, run: `cmd /c "npx.cmd tsc -b"`)*

---

## 📁 Project Directory Structure

```text
QueryLens/
├── deploy/                          # Deployment documentation & CI/CD workflows
│   ├── workflows/
│   │   ├── ci.yml                   # GitHub Actions CI typecheck & build pipeline
│   │   └── deploy.yml               # GitHub Actions Pages deployment pipeline
│   └── README.md                    # Detailed deployment documentation
├── scripts/
│   └── deploy.js                    # Automated ESM GitHub Pages deployment runner
├── src/
│   ├── components/                  # React UI components
│   │   ├── advisor/
│   │   │   └── IndexAdvisorCard.tsx # Multi-dialect index advisor & "What-If" simulator
│   │   ├── analysis/
│   │   │   └── QueryAnalysisCard.tsx# Terminal-style query diagnostics card
│   │   ├── batch/
│   │   │   └── BatchWorkloadModal.tsx# Multi-query batch & workload profiler modal
│   │   ├── benchmark/
│   │   │   └── BenchmarkRunner.tsx  # In-browser SQLite benchmark visualizer
│   │   ├── common/
│   │   │   ├── Badge.tsx            # Severity & status pills
│   │   │   ├── Header.tsx           # Top navigation bar with action triggers
│   │   │   └── SqlFileUploadZone.tsx# Reusable drag-and-drop .sql file uploader
│   │   ├── cost/
│   │   │   └── CostMeter.tsx        # ASCII cost meter & resource pressure bars
│   │   ├── editor/
│   │   │   ├── DialectSelector.tsx  # Postgres / MySQL / SQLite switcher
│   │   │   ├── SampleQueriesModal.tsx# Pre-loaded anti-pattern query library
│   │   │   └── SqlEditor.tsx        # Line-numbered SQL console with snippet injector
│   │   ├── history/
│   │   │   └── QueryHistoryDrawer.tsx# Slide-over query history & bookmarks drawer
│   │   ├── rewrite/
│   │   │   └── QueryDiffViewer.tsx  # Side-by-side & unified SQL diff viewer
│   │   ├── schema/
│   │   │   ├── CustomSchemaModal.tsx# Custom DDL schema importer modal
│   │   │   └── SchemaExplorerDrawer.tsx# Schema tables, columns & indexes drawer
│   │   └── visualizer/
│   │       ├── ExecutionPlanGraph.tsx# Interactive DAG execution plan visualizer
│   │       └── NodeInspector.tsx    # Operator complexity & bottleneck inspector
│   ├── engine/                      # Core QueryLens optimization engine
│   │   ├── advisor/
│   │   │   └── indexAdvisor.ts      # Index recommendation & compound ordering logic
│   │   ├── analyzer/
│   │   │   ├── costCalculator.ts    # CPU, Disk I/O & Memory pressure calculator
│   │   │   └── ruleEngine.ts        # Static analysis anti-pattern detection rules
│   │   ├── ast/
│   │   │   ├── parser.ts            # SQL AST tokenizer & predicate visitor
│   │   │   ├── sampleQueries.ts     # Pre-configured test query scenarios
│   │   │   └── schemaParser.ts      # Custom CREATE TABLE & CREATE INDEX DDL parser
│   │   ├── batch/
│   │   │   └── batchAnalyzer.ts     # Multi-query batch splitter & workload profiler
│   │   ├── benchmark/
│   │   │   └── sqliteRunner.ts      # SQLite WASM benchmark timing & dataset generator
│   │   ├── planner/
│   │   │   └── planBuilder.ts       # Query execution tree builder & operator model
│   │   └── rewriter/
│   │       ├── diffSql.ts           # Myers-style SQL line differ
│   │       └── queryRewriter.ts     # Selective projection & sargability transformer
│   ├── schemas/                     # Pre-loaded database catalog datasets
│   │   ├── ecommerce.ts             # RetailDB (50k orders, 10k customers)
│   │   ├── fintech.ts               # FinTechDB (1.2M transactions, 85k accounts)
│   │   ├── index.ts                 # Schemas catalog registry
│   │   └── saas.ts                  # CloudDB (240k users, 450k invoices)
│   ├── services/
│   │   └── historyStorage.ts        # LocalStorage persistence & bookmarking service
│   ├── types/
│   │   ├── batch.ts                 # Batch workload & consolidated index types
│   │   ├── history.ts               # Query history & bookmark models
│   │   └── index.ts                 # Global domain types & interfaces
│   ├── utils/
│   │   ├── exportReport.ts          # Executive Markdown audit report generator
│   │   ├── fileUpload.ts            # SQL file reader & validation utility
│   │   └── formatSql.ts             # SQL formatter wrapper
│   ├── App.tsx                      # Root application layout & state orchestrator
│   ├── index.css                    # Tailwind CSS directives & cyber glassmorphism styles
│   └── main.tsx                     # React 18 DOM entry point
├── package.json                     # Project manifest & npm scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS theme tokens & glow shadows
├── tsconfig.json                    # TypeScript compiler options
└── vite.config.ts                   # Vite build configuration & chunk splitting
```

---

## 👤 Author & Acknowledgments

- **Lead Developer**: [Humaam-04-06](https://github.com/Humaam-04-06)
- **Repository**: [https://github.com/Humaam-04-06/QueryLens](https://github.com/Humaam-04-06/QueryLens)
- **Live Demo**: [https://humaam-04-06.github.io/QueryLens/](https://humaam-04-06.github.io/QueryLens/)

Built with ❤️ for database engineers, backend architects, and developers who want faster SQL queries.
