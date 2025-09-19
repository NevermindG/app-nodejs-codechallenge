import { TransactionView, TransactionStatusName } from '@yape/shared';

export interface TransactionRepo {
  create(value: number, typeName: string, idempotencyKey?: string): Promise<TransactionView>;
  get(id: string): Promise<TransactionView | undefined>;
  updateStatus(id: string, status: TransactionStatusName): Promise<void>;
  getByIdempotencyKey?(key: string): Promise<TransactionView | undefined>;
}
