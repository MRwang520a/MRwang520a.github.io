import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/config.sqlite';
import { tasks } from '../db/schema.sqlite';
import { eq } from 'drizzle-orm';
import { aiService } from './ai.service';

export type TaskType = 'matting' | 'retouch' | 'background' | 'designer' | 'upscale' | 'translate';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CreateTaskParams {
  userId: string;
  taskType: TaskType;
  inputImageUrl?: string;
  parameters?: any;
}

/**
 * 任務服務類
 * 管理 AI 任務的創建、執行和狀態更新
 */
export class TaskService {
  /**
   * 創建新任務
   */
  async createTask(params: CreateTaskParams): Promise<string> {
    const taskId = uuidv4();

    await db.insert(tasks).values({
      id: taskId,
      userId: params.userId,
      taskType: params.taskType,
      status: 'pending',
      inputImageUrl: params.inputImageUrl,
      parameters: params.parameters,
      createdAt: new Date(),
    });

    // 異步執行任務
    this.executeTask(taskId).catch((error) => {
      console.error(`Task ${taskId} execution failed:`, error);
    });

    return taskId;
  }

  /**
   * 執行任務
   */
  private async executeTask(taskId: string): Promise<void> {
    try {
      // 更新狀態為 processing
      await db.update(tasks)
        .set({ status: 'processing' })
        .where(eq(tasks.id, taskId));

      // 獲取任務詳情
      const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

      if (!task) {
        throw new Error('Task not found');
      }

      let outputImageUrl: string;
      let resultData: any = {};

      // 根據任務類型執行相應的 AI 功能
      switch (task.taskType) {
        case 'matting':
          if (!task.inputImageUrl) throw new Error('Input image URL is required');
          outputImageUrl = await aiService.matting(task.inputImageUrl);
          break;

        case 'retouch':
          if (!task.inputImageUrl) throw new Error('Input image URL is required');
          outputImageUrl = await aiService.retouch(
            task.inputImageUrl,
            task.parameters || {} as any
          );
          break;

        case 'background':
          if (!task.inputImageUrl) throw new Error('Input image URL is required');
          if (!((task.parameters || {}) as any).prompt) throw new Error('Prompt is required');
          outputImageUrl = await aiService.generateBackground(
            task.inputImageUrl,
            task.parameters.prompt
          );
          break;

        case 'designer':
          if (!((task.parameters || {}) as any).prompt) throw new Error('Prompt is required');
          outputImageUrl = await aiService.generateImage(
            task.parameters.prompt,
            task.parameters.style
          );
          break;

        case 'upscale':
          if (!task.inputImageUrl) throw new Error('Input image URL is required');
          outputImageUrl = await aiService.upscaleImage(
            task.inputImageUrl,
            (task.parameters as any)?.scale || 2
          );
          break;

        case 'translate':
          if (!task.inputImageUrl) throw new Error('Input image URL is required');
          const translationResult = await aiService.translateImage(
            task.inputImageUrl,
            (task.parameters as any)?.targetLang || 'en'
          );
          outputImageUrl = translationResult.translatedImageUrl;
          resultData = {
            originalText: translationResult.originalText,
            translatedText: translationResult.translatedText,
          };
          break;

        default:
          throw new Error(`Unknown task type: ${task.taskType}`);
      }

      // 更新任務狀態為 completed
      await db.update(tasks)
        .set({
          status: 'completed',
          outputImageUrl,
          parameters: { ...task.parameters, ...resultData },
          completedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      console.log(`✅ Task ${taskId} completed successfully`);
    } catch (error) {
      // 更新任務狀態為 failed
      await db.update(tasks)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      console.error(`❌ Task ${taskId} failed:`, error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取任務
   */
  async getTaskById(taskId: string) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    return task || null;
  }

  /**
   * 獲取任務狀態
   */
  async getTaskStatus(taskId: string): Promise<{
    status: TaskStatus;
    outputImageUrl?: string;
    errorMessage?: string;
    parameters?: any;
  }> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

    if (!task) {
      throw new Error('Task not found');
    }

    return {
      status: task.status as TaskStatus,
      outputImageUrl: task.outputImageUrl || undefined,
      errorMessage: task.errorMessage || undefined,
      parameters: task.parameters,
    };
  }
}

// 導出單例
export const taskService = new TaskService();

