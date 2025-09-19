import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { buildRoutes } from './http/routes.js';
import { problemHandler, notFound } from './http/problem.js';
import { InMemoryTransactionRepo } from './infra/repo/InMemoryTransactionRepo.js';
import { KafkaBus } from './infra/kafka/KafkaBus.js';
import { TransactionService } from './application/TransactionService.js';
import { config } from './config/config.js';
import { logger } from './logger.js';
import { Container, TOKENS } from './di/container.js';

export const container = new Container();
container.register(TOKENS.Repo, () => new InMemoryTransactionRepo());
container.register(TOKENS.Bus, () => new KafkaBus(config.KAFKA_BROKERS));
container.register(TOKENS.Service, () => new TransactionService(
  container.resolve(TOKENS.Repo),
  container.resolve(TOKENS.Bus)
));

const service = container.resolve<TransactionService>(TOKENS.Service);

export const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', buildRoutes(service));
app.use(notFound);
app.use(problemHandler);

export async function subscribeStatus() {
  const bus = container.resolve<KafkaBus>(TOKENS.Bus);
  await bus.subscribe('transaction-status', async (msg) => {
    await service.handleStatusUpdate(msg);
    logger.info({ msg }, 'status updated');
  });
}

export async function connectBus(){
  const bus = container.resolve<KafkaBus>(TOKENS.Bus);
  await bus.connect();
}
