import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  req.user = {
    uid: 'mock-user-id',
    email: 'mock@example.com',
    name: 'Mock User',
  } as any;
  next();
};
