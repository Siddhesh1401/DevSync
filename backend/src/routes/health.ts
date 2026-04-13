import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'DevSync API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};
