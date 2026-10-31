import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, 'manifest.json');
const errors = [];

function requireFile(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    errors.push(`缺少文件：${relativePath}`);
  }
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`无法读取 manifest.json：${error.message}`);
  process.exit(1);
}

if (manifest.manifest_version !== 3) errors.push('manifest_version 必须为 3');
if (manifest.version !== '1.0.6') errors.push('版本必须为 1.0.6');
if (manifest.background?.service_worker !== 'background.js') {
  errors.push('必须声明 background.js 为 service worker');
}

const expectedPermissions = ['storage', 'activeTab', 'scripting'];
const permissions = [...(manifest.permissions ?? [])].sort();
if (JSON.stringify(permissions) !== JSON.stringify([...expectedPermissions].sort())) {
  errors.push(`权限集合不符：${permissions.join(', ')}`);
}

if (manifest.host_permissions?.length) errors.push('不应申请 host_permissions');
if (manifest.content_scripts?.length) errors.push('不应声明常驻 content_scripts');

for (const file of [
  'manifest.json',
  'background.js',
  'content.js',
  'icons/16.png',
  'icons/48.png',
  'icons/128.png',
  'README.md',
  'TEST-RESULTS.md',
  'dist/NovelFlow_1.0.6_Chrome.zip'
]) {
  requireFile(file);
}

if (errors.length) {
  console.error('扩展结构检查失败：');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`结构检查通过：Manifest V3 ${manifest.version}`);
console.log('运行文件：background.js、content.js、3 个图标');
console.log(`权限：${expectedPermissions.join(', ')}`);
