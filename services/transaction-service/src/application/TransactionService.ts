import { MessageBus } from '../ports/MessageBus.js';
import { TransactionRepo } from '../ports/TransactionRepo.js';
import { AppError } from '../http/problem.js';
import { CreateTx, CreateTxInput } from '../domain/validation.js';

export class TransactionService {
  constructor(private repo: TransactionRepo, private bus: MessageBus){}

  async create(input: unknown, idempotencyKey?: string) {
    const data = CreateTx.parse(input) as CreateTxInput;

    if (idempotencyKey) {
      const existing = await this.repo.getByIdempotencyKey?.(idempotencyKey);
      if (existing) return { transactionExternalId: existing.transactionExternalId };
    }

    const tx = await this.repo.create(data.value, String(data.tranferTypeId), idempotencyKey);
    await this.bus.publish('transaction-created', { id: tx.transactionExternalId, value: tx.value });
    return { transactionExternalId: tx.transactionExternalId };
  }

  async get(id: string) {
    const tx = await this.repo.get(id);
    if (!tx) throw new AppError('Transaction not found', 404);
    return tx;
  }

  async handleStatusUpdate(payload: { id: string; status: 'approved'|'rejected'|'pending' }) {
    if (!payload?.id || !payload?.status) return;
    await this.repo.updateStatus(payload.id, payload.status);
  }
}
