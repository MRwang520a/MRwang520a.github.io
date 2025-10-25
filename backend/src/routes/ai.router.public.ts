import { router, publicProcedure } from './trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { taskService } from '../services/task.service';

// 默認測試用戶 ID
const DEFAULT_USER_ID = 'b812f74e-1989-4933-ba8e-c5c049c91345';

// 定義輸入 schema
const imageInputSchema = z.object({
  imageUrl: z.string().url(),
});

const designerInputSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.string().optional(),
});

const backgroundInputSchema = z.object({
  imageUrl: z.string().url(),
  prompt: z.string().min(1).max(500),
});

const retouchInputSchema = z.object({
  imageUrl: z.string().url(),
  options: z.object({
    brightness: z.number().optional(),
    contrast: z.number().optional(),
    saturation: z.number().optional(),
  }).optional(),
});

const upscaleInputSchema = z.object({
  imageUrl: z.string().url(),
  scale: z.number().min(1).max(4).default(2),
});

const translateInputSchema = z.object({
  imageUrl: z.string().url(),
  targetLang: z.string().default('en'),
});

export const aiRouterPublic = router({
  // AI 萬物摳圖
  matting: publicProcedure
    .input(imageInputSchema)
    .mutation(async ({ input }) => {
      try {
        const taskId = await taskService.createTask({
          userId: DEFAULT_USER_ID,
          taskType: 'matting',
          inputImageUrl: input.imageUrl,
        });

        return {
          taskId,
          status: 'processing',
          message: 'Matting task created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create matting task',
          cause: error,
        });
      }
    }),

  // AI 產品精修
  retouch: publicProcedure
    .input(retouchInputSchema)
    .mutation(async ({ input }) => {
      try {
        const taskId = await taskService.createTask({
          userId: DEFAULT_USER_ID,
          taskType: 'retouch',
          inputImageUrl: input.imageUrl,
          parameters: input.options,
        });

        return {
          taskId,
          status: 'processing',
          message: 'Retouch task created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create retouch task',
          cause: error,
        });
      }
    }),

  // AI 背景合成
  background: publicProcedure
    .input(backgroundInputSchema)
    .mutation(async ({ input }) => {
      try {
        const taskId = await taskService.createTask({
          userId: DEFAULT_USER_ID,
          taskType: 'background',
          inputImageUrl: input.imageUrl,
          parameters: {
            prompt: input.prompt,
          },
        });

        return {
          taskId,
          status: 'processing',
          message: 'Background generation task created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate background',
          cause: error,
        });
      }
    }),

  // AI 設計師
  designer: publicProcedure
    .input(designerInputSchema)
    .mutation(async ({ input }) => {
      try {
        const taskId = await taskService.createTask({
          userId: DEFAULT_USER_ID,
          taskType: 'designer',
          parameters: {
            prompt: input.prompt,
            style: input.style,
          },
        });

        return {
          taskId,
          status: 'processing',
          message: 'Image generation task created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate image',
          cause: error,
        });
      }
    }),

  // AI 通用變清晰
  upscale: publicProcedure
    .input(upscaleInputSchema)
    .mutation(async ({ input }) => {
      try {
        const taskId = await taskService.createTask({
          userId: DEFAULT_USER_ID,
          taskType: 'upscale',
          inputImageUrl: input.imageUrl,
          parameters: {
            scale: input.scale,
          },
        });

        return {
          taskId,
          status: 'processing',
          message: 'Upscale task created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upscale image',
          cause: error,
        });
      }
    }),

  // AI 圖片翻譯
  translate: publicProcedure
    .input(translateInputSchema)
    .mutation(async ({ input }) => {
      try {
        const taskId = await taskService.createTask({
          userId: DEFAULT_USER_ID,
          taskType: 'translate',
          inputImageUrl: input.imageUrl,
          parameters: {
            targetLang: input.targetLang,
          },
        });

        return {
          taskId,
          status: 'processing',
          message: 'Translation task created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to translate image',
          cause: error,
        });
      }
    }),

  // 獲取任務狀態
  getTaskStatus: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      try {
        const task = await taskService.getTaskById(input.taskId);
        
        if (!task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found',
          });
        }

        return task;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get task status',
          cause: error,
        });
      }
    }),
});

