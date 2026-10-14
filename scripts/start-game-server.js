import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { context } from 'esbuild';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Vite clears dist during a client build; keep the server bundle independently.
const output = resolve(rootDir, 'node_modules/.cache/beast-link/server.cjs');
let child;
let stopping = false;
let buildContext;
async function stopChild() {
  const previous = child;
  child = undefined;
  if (!previous || previous.exitCode !== null || previous.signalCode !== null) return;
  await new Promise(resolveExit => {
    previous.once('exit', resolveExit);
    previous.kill();
  });
}

buildContext = await context({
  absWorkingDir: rootDir,
  entryPoints: ['src/server/startServer.ts'],
  bundle: true, platform: 'node', format: 'cjs', outfile: output,
  plugins: [{ name: 'restart-game-server', setup(build) {
    build.onEnd(async result => {
      if (result.errors.length || stopping) return;
      await stopChild();
      if (stopping) return;
      console.log('[BeastLink Server] Starting latest bundle. Existing rooms reset on rebuild.');
      child = spawn(process.execPath, [output], { cwd: rootDir, stdio: 'inherit', windowsHide: true });
      child.on('error', error => console.error('[BeastLink Server]', error));
    });
  } }],
});
await buildContext.watch();
console.log('[BeastLink Server] Watching server source for changes.');
async function shutdown() {
  if (stopping) return;
  stopping = true;
  await buildContext.dispose();
  await stopChild();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
