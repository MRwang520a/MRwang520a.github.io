import { router, publicProcedure } from './trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { taskService } from '../services/task.service';

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

export const aiRouterV2 = router({
  // AI 萬物摳圖
  matting: publicProcedure
    .input(imageInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const taskId = await taskService.createTask({
          userId: 'b812f74e-1989-4933-ba8e-c5c049c91345', // 默認測試用戶
          taskType: 'matting',
          inputImageUrl: input.imageUrl,
        });

        return {
          taskId,
          status: 'processing',
          message: 'Image matting task created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process image matting',
          cause: error,
        });
      }
    }),

  // AI 產品精修
  retouch: publicProcedure
    .input(retouchInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const taskId = await taskService.createTask({
          userId: 'b812f74e-1989-4933-ba8e-c5c049c91345', // 默認測試用戶
          taskType: 'retouch',
          inputImageUrl: input.imageUrl,
          parameters: input.options,
        });

        return {
          taskId,
          status: 'processing',
          message: 'Image retouching task created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process image retouching',
          cause: error,
        });
      }
    }),

  // AI 背景合成
  background: publicProcedure
    .input(backgroundInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const taskId = await taskService.createTask({
          userId: 'b812f74e-1989-4933-ba8e-c5c049c91345', // 默認測試用戶
          taskType: 'background',
          inputImageUrl: input.imageUrl,
          parameters: { prompt: input.prompt },
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
    .mutation(async ({ input, ctx }) => {
      try {
        const taskId = await taskService.createTask({
          userId: 'b812f74e-1989-4933-ba8e-c5c049c91345', // 默認測試用戶
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
    .mutation(async ({ input, ctx }) => {
      try {
        const taskId = await taskService.createTask({
          userId: 'b812f74e-1989-4933-ba8e-c5c049c91345', // 默認測試用戶
          taskType: 'upscale',
          inputImageUrl: input.imageUrl,
          parameters: { scale: input.scale },
        });

        return {
          taskId,
          status: 'processing',
          message: 'Image upscaling task created successfully',
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
    .mutation(async ({ input, ctx }) => {
      try {
        const taskId = await taskService.createTask({
          userId: 'b812f74e-1989-4933-ba8e-c5c049c91345', // 默認測試用戶
          taskType: 'translate',
          inputImageUrl: input.imageUrl,
          parameters: { targetLang: input.targetLang },
        });

        return {
          taskId,
          status: 'processing',
          message: 'Image translation task created successfully',
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
    .input(z.object({
      taskId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const status = await taskService.getTaskStatus(input.taskId);
        return status;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get task status',
          cause: error,
        });
      }
    }),
});

