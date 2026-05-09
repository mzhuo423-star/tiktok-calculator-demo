const fs = require('fs');
const path = require('path');

const root = __dirname;
const outDir = path.join(root, 'dist');
const files = ['index.html', 'style.css', 'script.js'];
const apiBase = process.env.VERCEL_API_BASE || process.env.API_BASE || '';

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
    fs.copyFileSync(path.join(root, file), path.join(outDir, file));
}

fs.writeFileSync(
    path.join(outDir, 'config.js'),
    `window.APP_CONFIG = ${JSON.stringify({ API_BASE: apiBase }, null, 4)};\n`
);
