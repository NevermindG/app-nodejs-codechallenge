import request from 'supertest';
import { app } from '../src/app';
import * as appModule from '../src/app';

jest.spyOn(appModule, 'connectBus').mockResolvedValue();
jest.spyOn(appModule, 'subscribeStatus').mockResolvedValue();

describe('validation', () => {
  it('rejects when same account ids', async () => {
    const acc = '11111111-1111-4111-8111-111111111111';
    const res = await request(app)
      .post('/api/v1/transactions')
      .send({ accountExternalIdDebit: acc, accountExternalIdCredit: acc, tranferTypeId: 1, value: 100 })
      .expect(422);
    expect(res.body.title).toBeDefined();
  });

  it('rejects when account is not UUID', async () => {
    await request(app)
      .post('/api/v1/transactions')
      .send({ accountExternalIdDebit: 'A', accountExternalIdCredit: 'B', tranferTypeId: 1, value: 100 })
      .expect(400);
  });

  it('rejects when value not integer', async () => {
    const d = '11111111-1111-4111-8111-111111111111';
    const c = '22222222-2222-4222-8222-222222222222';
    await request(app)
      .post('/api/v1/transactions')
      .send({ accountExternalIdDebit: d, accountExternalIdCredit: c, tranferTypeId: 1, value: 10.5 })
      .expect(400);
  });

  it('accepts valid payload', async () => {
    const d = '11111111-1111-4111-8111-111111111111';
    const c = '22222222-2222-4222-8222-222222222222';
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Idempotency-Key', 'key-1')
      .send({ accountExternalIdDebit: d, accountExternalIdCredit: c, tranferTypeId: 2, value: 500 })
      .expect(201);
    expect(res.body.transactionExternalId).toBeDefined();
  });
});
