# 🚀 QueryLens CI/CD & Deployment Guide

This directory contains deployment scripts and CI/CD workflow configurations for **QueryLens**.

---

## 🌐 Option 1: Instant CLI Deployment (Recommended)

You can deploy the latest production build of QueryLens to GitHub Pages at any time with a single command:

```bash
npm run deploy
```

### What this command does:
1. Compiles the TypeScript codebase and builds optimized production bundles with Vite (`GITHUB_PAGES=true` to configure base path `/QueryLens/`).
2. Creates `.nojekyll` to prevent GitHub from ignoring asset directories.
3. Generates a fallback `404.html` for client-side routing.
4. Force-pushes the static assets directly to the `gh-pages` branch on GitHub.
5. Your application is immediately live at: **[https://humaam-04-06.github.io/QueryLens/](https://humaam-04-06.github.io/QueryLens/)**

---

## ⚙️ Option 2: Automated GitHub Actions CI/CD

Pre-configured workflow templates are located in `deploy/workflows/`:

- **[`ci.yml`](file:///d:/Database_Query_Optimizer/deploy/workflows/ci.yml)**: Continuous Integration pipeline that checks TypeScript types (`tsc -b`) and validates production builds on every push and pull request.
- **[`deploy.yml`](file:///d:/Database_Query_Optimizer/deploy/workflows/deploy.yml)**: GitHub Pages deployment pipeline using official GitHub Actions (`actions/deploy-pages@v4`).

### To activate GitHub Actions in your repo:
1. In your GitHub repository settings, enable GitHub Pages:
   - Go to **Settings** ➔ **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions** (or **Deploy from a branch** ➔ `gh-pages`).
2. Copy the workflow files into `.github/workflows/`:
   ```bash
   mkdir -p .github/workflows
   cp deploy/workflows/*.yml .github/workflows/
   ```
3. Push to `main` — GitHub Actions will automatically build and deploy on every commit!
