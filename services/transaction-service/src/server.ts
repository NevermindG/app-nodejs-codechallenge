import { app, connectBus, subscribeStatus } from './app.js';
import { config } from './config/config.js';
import { logger } from './logger.js';

let shuttingDown = false;
const serverStart = async () => {
  await connectBus();
  await subscribeStatus();
  const srv = app.listen(config.PORT, () => logger.info(`transaction-service on ${config.PORT}`));

  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true as any;
    logger.info('Shutting down...');
    srv.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};
serverStart().catch((e) => { logger.error(e); process.exit(1); });
