const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const assetsDir = __dirname;
const appIconSvg = path.join(assetsDir, 'forkpin-app-icon.svg');
const transparentSvg = path.join(assetsDir, 'forkpin.svg');

const targets = [
  { input: appIconSvg, output: 'favicon-16x16.png', size: 16 },
  { input: appIconSvg, output: 'favicon-32x32.png', size: 32 },
  { input: appIconSvg, output: 'apple-touch-icon.png', size: 180 },
  { input: appIconSvg, output: 'android-chrome-192x192.png', size: 192 },
  { input: appIconSvg, output: 'android-chrome-512x512.png', size: 512 },
  { input: appIconSvg, output: 'app-store-1024x1024.png', size: 1024 },
  { input: transparentSvg, output: 'forkpin-transparent-512.png', size: 512 }
];

console.log('🚀 Generating Pin2Plate ForkPin icon pack via sharp-cli...');

for (const t of targets) {
  const destPath = path.join(assetsDir, t.output);
  const cmd = `npx -y sharp-cli -i "${t.input}" -o "${destPath}" --format png resize ${t.size} ${t.size}`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ Generated: ${t.output} (${t.size}x${t.size}px)`);
  } catch (err) {
    console.error(`❌ Failed: ${t.output}`, err.message);
  }
}

console.log('\n✨ All ForkPin icon assets generated successfully in:', assetsDir);
