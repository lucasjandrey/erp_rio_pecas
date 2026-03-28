import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Authorization header not provided.' });

  const [, token] = header.split(' ');
  try {
    res.locals.auth = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}
