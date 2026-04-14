import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

/**
 * Middleware that requires a valid Supabase JWT in Authorization header.
 * Attaches user to req.user on success, returns 401 on failure.
 */
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized — missing token' } });
    return;
  }

  const token = authHeader.substring(7);

  supabase.auth
    .getUser(token)
    .then(({ data, error }) => {
      if (error || !data.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized — invalid token' } });
        return;
      }
      req.user = { id: data.user.id, email: data.user.email || '' };
      next();
    })
    .catch(() => {
      res.status(500).json({ success: false, error: { message: 'Auth check failed' } });
    });
};
