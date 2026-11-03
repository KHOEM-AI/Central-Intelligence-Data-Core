import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(HERE, '..', '..');
const BASE_DIR = join(ROOT_DIR, 'security', '.baselines');
const LOG = join(ROOT_DIR, 'security', '.integrity.log');
const ROOTS_FILE = join(HERE, 'roots.json');

const SKIP_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', 'build', 'coverage', '.vite', '.pnpm-store', '.cache', '.baselines']);
const ROOT_ONLY_SKIP = new Set(['data', 'data_clean', 'output', 'logs', 'tmp', 'corpus-sample']);
const SKIP_FILE = /(\.(log|pid|tmp)$)|\.bak|\.backup|\.before-|\.broken-backup|\.zoom-backup|^\.baseline\.json$|^\.integrity\.log$/;
const MAX_SIZE = 2 * 1024 * 1024;

function loadRoots() {
  const list = JSON.parse(readFileSync(ROOTS_FILE, 'utf8'));
  return list.map(r => ({ name: r.name, path: r.path.replace(/^~/, homedir()) }));
}

function walk(root) {
  const files = {}; let skipped = 0;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { skipped++; continue; }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        if (dir === root && ROOT_ONLY_SKIP.has(e.name)) continue;
        stack.push(p);
      } else if (e.isFile() && !SKIP_FILE.test(e.name)) {
        try {
          if (statSync(p).size > MAX_SIZE) { skipped++; continue; }
          files[relative(root, p)] = createHash('sha256').update(readFileSync(p)).digest('hex');
        } catch { skipped++; }
      }
    }
  }
  return { files, skipped };
}

const baseFile = (name) => join(BASE_DIR, `${name}.json`);

function initRoot(r) {
  if (!existsSync(r.path)) return { name: r.name, ok: false, error: 'រកមិនឃើញ folder' };
  const { files, skipped } = walk(r.path);
  mkdirSync(BASE_DIR, { recursive: true });
  writeFileSync(baseFile(r.name), JSON.stringify({ created: new Date().toISOString(), files }, null, 2));
  return { name: r.name, ok: true, files: Object.keys(files).length, skipped };
}

function checkRoot(r) {
  if (!existsSync(r.path)) return { name: r.name, path: r.path, ok: false, error: 'រកមិនឃើញ folder' };
  if (!existsSync(baseFile(r.name))) return { name: r.name, path: r.path, ok: false, error: `គ្មាន baseline (រត់: node security/file-integrity/integrity.mjs init ${r.name})` };
  const base = JSON.parse(readFileSync(baseFile(r.name), 'utf8')).files;
  const { files: now, skipped } = walk(r.path);
  const added = Object.keys(now).filter(f => !(f in base));
  const missing = Object.keys(base).filter(f => !(f in now));
  const changed = Object.keys(now).filter(f => f in base && base[f] !== now[f]);
  return { name: r.name, path: r.path, ok: !added.length && !missing.length && !changed.length, files: Object.keys(now).length, skipped, added, missing, changed };
}

const [cmd, ...rest] = process.argv.slice(2);
const json = rest.includes('--json');
const only = rest.find(a => !a.startsWith('--'));
let roots = loadRoots();
if (only) roots = roots.filter(r => r.name === only);
if (!roots.length || !['init', 'check'].includes(cmd)) {
  console.log('Usage: node security/file-integrity/integrity.mjs init|check [name] [--json]');
  process.exit(2);
}

if (cmd === 'init') {
  for (const r of roots) {
    const res = initRoot(r);
    console.log(res.ok ? `${res.name}: baseline saved (${res.files} files, skipped ${res.skipped})` : `${res.name}: ${res.error}`);
  }
} else {
  const results = roots.map(checkRoot);
  const ok = results.every(r => r.ok);
  const out = { ok, checkedAt: new Date().toISOString(), roots: results };
  appendFileSync(LOG, JSON.stringify({ time: out.checkedAt, ok, roots: results.map(r => ({ name: r.name, ok: r.ok, added: r.added?.length ?? 0, missing: r.missing?.length ?? 0, changed: r.changed?.length ?? 0, error: r.error })) }) + '\n');
  if (json) console.log(JSON.stringify(out));
  else for (const r of results) {
    if (r.error) console.log(`✗ ${r.name}: ${r.error}`);
    else if (r.ok) console.log(`✓ ${r.name}: OK (${r.files} files)`);
    else console.log(`⚠ ${r.name}:`, { added: r.added, missing: r.missing, changed: r.changed });
  }
  process.exit(ok ? 0 : 1);
}
