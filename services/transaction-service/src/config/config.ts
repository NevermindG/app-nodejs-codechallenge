import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  KAFKA_BROKERS: z.string().default('localhost:19092'),
  NODE_ENV: z.string().default('development'),
});

export type AppConfig = z.infer<typeof schema>;
export const config: AppConfig = schema.parse(process.env);
