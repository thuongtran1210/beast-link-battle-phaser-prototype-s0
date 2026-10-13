import { GameServer } from './GameServer';

const PORT = Number(process.env.PORT) || 3000;
const server = new GameServer();

server
  .start(PORT)
  .then(() => {
    console.log(`[BeastLink Server] Authoritative Game Server running on ws://localhost:${PORT}`);
    console.log(`[BeastLink Server] Ready to accept PvP & Co-op room connections.`);
  })
  .catch((err) => {
    console.error('[BeastLink Server] Failed to start server:', err);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  console.log('\n[BeastLink Server] Shutting down server...');
  await server.stop();
  process.exit(0);
});
