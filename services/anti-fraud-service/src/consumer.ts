import { Kafka } from 'kafkajs';
import { decide } from './decision.js';
import { logger } from './logger.js';

const MAX_RETRIES = 5;

export async function runConsumer(brokers: string) {
  const kafka = new Kafka({ brokers: brokers.split(',') });
  const consumer = kafka.consumer({ groupId: 'anti-fraud' });
  const producer = kafka.producer();

  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'transaction-created', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const { id, value } = JSON.parse(message.value.toString()) as { id: string; value: number };
      const status = decide(value);
      let attempts = 0;
      while (true) {
        try {
          await producer.send({ topic: 'transaction-status', messages: [{ value: JSON.stringify({ id, status }) }] });
          logger.info({ id, status }, 'evaluated');
          break;
        } catch (e) {
          attempts++;
          if (attempts >= MAX_RETRIES) {
            logger.error({ err: e, id }, 'failed to publish status');
            break;
          }
          const backoff = Math.min(1000 * attempts, 5000);
          await new Promise(r => setTimeout(r, backoff));
        }
      }
    }
  });
}
