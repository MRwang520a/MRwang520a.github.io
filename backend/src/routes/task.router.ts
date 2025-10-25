import { router, protectedProcedure } from './trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, desc } from 'drizzle-orm';
import { tasks } from '../db/schema';

export const taskRouter = router({
  // 根據 ID 獲取任務
  getById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const [task] = await ctx.db
          .select()
          .from(tasks)
          .where(and(
            eq(tasks.id, input.id),
            eq(tasks.userId, ctx.user.id)
          ))
          .limit(1);

        if (!task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found',
          });
        }

        return task;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch task',
          cause: error,
        });
      }
    }),

  // 獲取用戶的所有任務
  listByUser: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      taskType: z.enum(['matting', 'retouch', 'background', 'designer', 'upscale', 'translate']).optional(),
      status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const conditions = [eq(tasks.userId, ctx.user.id)];
        
        if (input.taskType) {
          conditions.push(eq(tasks.taskType, input.taskType));
        }
        
        if (input.status) {
          conditions.push(eq(tasks.status, input.status));
        }

        const userTasks = await ctx.db
          .select()
          .from(tasks)
          .where(and(...conditions))
          .orderBy(desc(tasks.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          tasks: userTasks,
          total: userTasks.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tasks',
          cause: error,
        });
      }
    }),

  // 取消任務
  cancel: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // 首先檢查任務是否存在且屬於當前用戶
        const [task] = await ctx.db
          .select()
          .from(tasks)
          .where(and(
            eq(tasks.id, input.id),
            eq(tasks.userId, ctx.user.id)
          ))
          .limit(1);

        if (!task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found',
          });
        }

        // 只能取消 pending 或 processing 狀態的任務
        if (task.status !== 'pending' && task.status !== 'processing') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot cancel a task that is already completed or failed',
          });
        }

        // 更新任務狀態為 failed
        await ctx.db
          .update(tasks)
          .set({
            status: 'failed',
            errorMessage: 'Task cancelled by user',
            completedAt: new Date(),
          })
          .where(eq(tasks.id, input.id));

        return {
          success: true,
          message: 'Task cancelled successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel task',
          cause: error,
        });
      }
    }),
});

