import request from 'supertest';
import { app } from '../src/app';
import * as appModule from '../src/app';
import { TransactionRepo } from '../src/ports/TransactionRepo';

// Mock bus connect/subscribe to avoid Kafka
jest.spyOn(appModule, 'connectBus').mockResolvedValue();
jest.spyOn(appModule, 'subscribeStatus').mockResolvedValue();

describe('transactions API (hex ports/adapters)', () => {
  it('creates a transaction and returns an external id', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .send({ accountExternalIdDebit: 'A', accountExternalIdCredit: 'B', tranferTypeId: 1, value: 500 })
      .expect(201);

    expect(res.body.transactionExternalId).toBeDefined();

    const txId = res.body.transactionExternalId;
    const fetched = await request(app).get(`/api/v1/transactions/${txId}`).expect(200);
    expect(fetched.body.transactionStatus.name).toBe('pending');
  });

  it('rejects same-account transfer (domain rule)', async () => {
    await request(app)
      .post('/api/v1/transactions')
      .send({ accountExternalIdDebit: 'A', accountExternalIdCredit: 'A', tranferTypeId: 1, value: 500 })
      .expect(422);
  });

  it('validates body (400)', async () => {
    await request(app).post('/api/v1/transactions').send({}).expect(400);
  });
});
