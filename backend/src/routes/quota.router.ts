import { router, protectedProcedure } from './trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import { userQuotas } from '../db/schema';

export const quotaRouter = router({
  // 獲取用戶剩餘配額
  getRemaining: protectedProcedure
    .input(z.object({
      quotaType: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const conditions = [eq(userQuotas.userId, ctx.user.id)];
        
        if (input.quotaType) {
          conditions.push(eq(userQuotas.quotaType, input.quotaType));
        }

        const quotas = await ctx.db
          .select()
          .from(userQuotas)
          .where(and(...conditions));

        return quotas.map(quota => ({
          quotaType: quota.quotaType,
          totalQuota: quota.totalQuota,
          usedQuota: quota.usedQuota,
          remainingQuota: (quota.totalQuota || 0) - (quota.usedQuota || 0),
          resetAt: quota.resetAt,
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch quota information',
          cause: error,
        });
      }
    }),

  // 消耗配額
  consume: protectedProcedure
    .input(z.object({
      quotaType: z.string(),
      amount: z.number().min(1).default(1),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // 查找用戶的配額記錄
        const [quota] = await ctx.db
          .select()
          .from(userQuotas)
          .where(and(
            eq(userQuotas.userId, ctx.user.id),
            eq(userQuotas.quotaType, input.quotaType)
          ))
          .limit(1);

        if (!quota) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Quota not found for this user',
          });
        }

        const remainingQuota = (quota.totalQuota || 0) - (quota.usedQuota || 0);
        
        if (remainingQuota < input.amount) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient quota',
          });
        }

        // 更新已使用配額
        await ctx.db
          .update(userQuotas)
          .set({
            usedQuota: (quota.usedQuota || 0) + input.amount,
          })
          .where(eq(userQuotas.id, quota.id));

        return {
          success: true,
          remainingQuota: remainingQuota - input.amount,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to consume quota',
          cause: error,
        });
      }
    }),
});

