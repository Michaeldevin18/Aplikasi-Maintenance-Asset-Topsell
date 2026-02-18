/**
 * local server entry file, for local development
 */
import app from './app.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT.`);
    process.exit(1);
  }

  console.error('Server error:', err);
  process.exit(1);
});

const shutdown = (signal: string, cb?: () => void) => {
  console.log(`${signal} signal received`);
  server.close(() => {
    console.log('Server closed');
    cb?.();
  });
};

/**
 * close server
 */
process.on('SIGTERM', () => {
  shutdown('SIGTERM', () => process.exit(0));
});

process.on('SIGINT', () => {
  shutdown('SIGINT', () => process.exit(0));
});

process.once('SIGUSR2', () => {
  shutdown('SIGUSR2', () => process.kill(process.pid, 'SIGUSR2'));
});

export default app;
