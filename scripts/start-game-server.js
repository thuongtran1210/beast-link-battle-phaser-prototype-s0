import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

console.log('[BeastLink Server] Bundling src/server/startServer.ts...');

const esbuild = spawn('npx', ['esbuild', 'src/server/startServer.ts', '--bundle', '--platform=node', '--format=cjs', '--outfile=dist/server.cjs'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit',
});

esbuild.on('close', (code) => {
  if (code !== 0) {
    console.error(`[BeastLink Server] esbuild failed with exit code ${code}`);
    process.exit(code ?? 1);
  }

  console.log('[BeastLink Server] Starting server process...');
  const server = spawn('node', ['dist/server.cjs'], {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit',
  });

  server.on('close', (serverCode) => {
    process.exit(serverCode ?? 0);
  });
});
