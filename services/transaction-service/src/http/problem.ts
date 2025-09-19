import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  type?: string;
  detail?: any;
  constructor(message: string, status = 400, type = 'about:blank', detail?: any) {
    super(message);
    this.status = status;
    this.type = type;
    this.detail = detail;
  }
}

export function problemHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err?.name === 'ZodError') {
    return res.status(400).type('application/problem+json').json({
      type: 'https://zod.dev/validation-error',
      title: 'Validation Error',
      status: 400,
      detail: err.issues,
    });
  }
  const status = err?.status ?? 500;
  const body = {
    type: err?.type ?? 'about:blank',
    title: status === 500 ? 'Internal Server Error' : err?.message ?? 'Error',
    status,
    detail: err?.detail,
  };
  return res.status(status).type('application/problem+json').json(body);
}

export const notFound = (_req: Request, _res: Response, next: NextFunction) => next(new AppError('Not Found', 404));
