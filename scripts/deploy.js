/**
 * Automated GitHub Pages Deployment Script (ESM)
 * Builds production assets and publishes them to the gh-pages branch.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('\n========================================');
console.log('🚀 QueryLens GitHub Pages Deployer');
console.log('========================================\n');

try {
  // 1. Build the production bundle with GITHUB_PAGES=true for correct base path (/QueryLens/)
  console.log('📦 Step 1: Building optimized production bundle...');
  execSync('npm run build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, GITHUB_PAGES: 'true' }
  });

  if (!fs.existsSync(distDir)) {
    throw new Error('Build failed: "dist" directory not found.');
  }

  // 2. Add .nojekyll to prevent GitHub Pages from ignoring assets with underscores
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
  console.log('✓ Created .nojekyll');

  // 3. Add 404.html as a copy of index.html for SPA route fallback
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✓ Created 404.html fallback');
  }

  // 4. Retrieve current remote URL
  const remoteUrl = execSync('git config --get remote.origin.url', { cwd: rootDir }).toString().trim();
  console.log(`✓ Target remote: ${remoteUrl}`);

  // 5. Initialize git in dist directory and push to gh-pages branch
  console.log('🚀 Step 2: Deploying static assets to gh-pages branch...');
  const runInDist = (cmd) => execSync(cmd, { cwd: distDir, stdio: 'pipe' });

  // Clean any existing git in dist
  const distGitDir = path.join(distDir, '.git');
  if (fs.existsSync(distGitDir)) {
    fs.rmSync(distGitDir, { recursive: true, force: true });
  }

  runInDist('git init');
  runInDist('git config user.name "Humaam-04-06"');
  runInDist('git config user.email "humaamahmed40@gmail.com"');
  runInDist('git checkout -b gh-pages');
  runInDist('git add -A');
  runInDist('git commit -m "deploy: automated release to github pages"');
  runInDist(`git remote add origin ${remoteUrl}`);

  console.log('📡 Pushing to origin/gh-pages...');
  runInDist('git push --force origin gh-pages');

  console.log('\n========================================');
  console.log('🎉 QueryLens successfully deployed to GitHub Pages!');
  console.log('🔗 Live URL: https://humaam-04-06.github.io/QueryLens/');
  console.log('========================================\n');
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  if (error.stderr) {
    console.error(error.stderr.toString());
  }
  process.exit(1);
}
