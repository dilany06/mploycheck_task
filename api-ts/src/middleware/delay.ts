import { NextFunction, Request, Response } from 'express';

export function artificialDelay(req: Request, _res: Response, next: NextFunction): void {
  const requestedDelay = Number(req.query.delay ?? 0);
  const delay = Number.isFinite(requestedDelay) ? Math.min(Math.max(requestedDelay, 0), 5000) : 0;

  setTimeout(next, delay);
}
