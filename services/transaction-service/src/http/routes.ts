import { Router } from 'express';
import { ah } from './asyncHandler.js';
import { TransactionService } from '../application/TransactionService.js';

export function buildRoutes(service: TransactionService) {
  const r = Router();

  r.post('/transactions', ah(async (req, res) => {
    const idem = req.header('Idempotency-Key') || undefined;
    const result = await service.create(req.body, idem);
    res.status(201).json(result);
  }));

  r.get('/transactions/:id', ah(async (req, res) => {
    const tx = await service.get(req.params.id);
    res.json(tx);
  }));

  r.get('/health', (_req, res) => res.json({ status: 'ok' }));

  return r;
}
