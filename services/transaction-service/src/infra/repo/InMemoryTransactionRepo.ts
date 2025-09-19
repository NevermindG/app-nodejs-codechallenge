import { TransactionRepo } from '../../ports/TransactionRepo.js';
import { TransactionView } from '@yape/shared';
import { uuid } from '../../utils/uuid.js';

export class InMemoryTransactionRepo implements TransactionRepo {
  private store = new Map<string, TransactionView>();
  private byKey = new Map<string, string>();

  async create(value: number, typeName: string, idempotencyKey?: string): Promise<TransactionView> {
    if (idempotencyKey) {
      const existingId = this.byKey.get(idempotencyKey);
      if (existingId) {
        const existing = this.store.get(existingId);
        if (existing) return existing;
      }
    }
    const tx: TransactionView = {
      transactionExternalId: uuid(),
      transactionType: { name: typeName },
      transactionStatus: { name: 'pending' },
      value,
      createdAt: new Date().toISOString()
    };
    this.store.set(tx.transactionExternalId, tx);
    if (idempotencyKey) this.byKey.set(idempotencyKey, tx.transactionExternalId);
    return tx;
  }

  async get(id: string): Promise<TransactionView | undefined> {
    return this.store.get(id);
  }
  async updateStatus(id: string, status: 'approved'|'rejected'|'pending'): Promise<void> {
    const tx = this.store.get(id);
    if (tx) {
      tx.transactionStatus.name = status;
      this.store.set(id, tx);
    }
  }
  async getByIdempotencyKey(key: string): Promise<TransactionView | undefined> {
    const id = this.byKey.get(key);
    return id ? this.store.get(id) : undefined;
  }
}
