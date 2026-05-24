import fs from 'fs';
import path from 'path';

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function buildServiceWorker() {
  const distDir = 'dist';
  const swPath = path.join(distDir, 'sw.js');
  
  if (!fs.existsSync(swPath)) {
    console.error('build-sw: dist/sw.js not found! Run npm run build first.');
    process.exit(1);
  }
  
  // Find all built files in dist
  const allFiles = walkDir(distDir);
  
  // Format files to root-relative URLs
  const assets = allFiles
    .map(file => {
      // Convert Windows backslashes to forward slashes and make relative to dist/
      let relPath = path.relative(distDir, file).replace(/\\/g, '/');
      return '/' + relPath;
    })
    .filter(file => {
      // Exclude service worker itself, maps, and any config files
      return (
        file !== '/sw.js' &&
        !file.endsWith('.map') &&
        file !== '/vercel.json' &&
        file !== '/security_and_mobile_summary.html'
      );
    });
    
  // Add root path to cache
  assets.unshift('/');
  
  // Read dist/sw.js
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Replace ASSETS_TO_CACHE array with the dynamically discovered asset list
  const assetsArrayString = JSON.stringify(assets, null, 2);
  const regex = /const ASSETS_TO_CACHE = \[\s*[\s\S]*?\];/;
  
  if (!regex.test(swContent)) {
    console.error('build-sw: Could not find ASSETS_TO_CACHE array in sw.js');
    process.exit(1);
  }
  
  swContent = swContent.replace(regex, `const ASSETS_TO_CACHE = ${assetsArrayString};`);
  
  // Also bump the cache version dynamically using a timestamp to force updates!
  const buildId = Date.now();
  swContent = swContent.replace(
    /const CACHE_NAME = 'de-expense-cache-v\d+';/,
    `const CACHE_NAME = 'de-expense-cache-v${buildId}';`
  );
  
  fs.writeFileSync(swPath, swContent, 'utf8');
  console.log(`build-sw: Successfully injected ${assets.length} static assets and generated cache id 'de-expense-cache-v${buildId}' in dist/sw.js!`);
}

buildServiceWorker();
