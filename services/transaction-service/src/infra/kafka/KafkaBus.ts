import { Kafka } from 'kafkajs';
import { MessageBus } from '../../ports/MessageBus.js';

export class KafkaBus implements MessageBus {
  private kafka;
  private producer;
  private consumer;
  constructor(brokers: string, private groupId = 'transaction-service') {
    this.kafka = new Kafka({ brokers: brokers.split(',') });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
  }
  async connect(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
  }
  async publish(topic: string, payload: any): Promise<void> {
    await this.producer.send({ topic, messages: [{ value: JSON.stringify(payload) }] });
  }
  async subscribe(topic: string, onMessage: (payload: any) => Promise<void>): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const data = JSON.parse(message.value.toString());
        await onMessage(data);
      }
    });
  }
  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }
}
