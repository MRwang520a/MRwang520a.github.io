import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from '../types/context';
import { z } from 'zod';

// 初始化 tRPC
const t = initTRPC.context<Context>().create();

// 導出 tRPC 的基礎構建塊
export const router = t.router;
// 創建公開的 procedure（無需登錄，但會設置默認用戶）
export const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
  // 如果沒有用戶，設置默認測試用戶
  if (!ctx.user) {
    ctx.user = {
      id: 'b812f74e-1989-4933-ba8e-c5c049c91345',
      email: 'test@example.com',
      username: 'Test User',
    };
  }
  
  return next({
    ctx,
  });
});

// 創建受保護的 procedure（需要用戶登錄）
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// 創建中間件來記錄請求
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  
  console.log(`[tRPC] ${type} ${path} - ${durationMs}ms`);
  
  return result;
});

// 帶日誌的 procedure
export const loggedProcedure = t.procedure.use(loggerMiddleware);

