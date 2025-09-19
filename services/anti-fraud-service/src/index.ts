import { runConsumer } from './consumer.js';

const brokers = process.env.KAFKA_BROKERS ?? 'localhost:19092';
runConsumer(brokers).catch((e) => { console.error(e); process.exit(1); });
