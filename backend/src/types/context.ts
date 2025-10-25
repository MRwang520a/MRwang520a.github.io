import { Request, Response } from 'express';
import { db } from '../db/config';

export interface User {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
}

export interface Context {
  req: Request;
  res: Response;
  db: typeof db;
  user?: User;
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  // 從 session 或 JWT 中獲取用戶信息
  const user = (req as any).user as User | undefined;

  return {
    req,
    res,
    db,
    user,
  };
}

