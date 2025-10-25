import { router, publicProcedure, protectedProcedure } from './trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  // 獲取當前用戶信息
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // 登出
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // 清除 session
    if (ctx.req.session) {
      ctx.req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }
    
    return { success: true, message: 'Logged out successfully' };
  }),

  // OAuth 回調處理（這個會在實現 Manus OAuth 時完善）
  handleCallback: publicProcedure
    .input(z.object({
      code: z.string(),
      state: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: 實現 Manus OAuth 回調處理
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'OAuth callback handler not implemented yet',
      });
    }),
});

