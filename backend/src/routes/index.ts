import { router } from './trpc';
import { authRouter } from './auth.router';
import { aiRouter } from './ai.router';
import { aiRouterPublic } from './ai.router.public';
import { taskRouter } from './task.router';
import { quotaRouter } from './quota.router';

// 合併所有路由
export const appRouter = router({
  auth: authRouter,
  ai: aiRouterPublic, // 使用公開版本的 AI 路由
  task: taskRouter,
  quota: quotaRouter,
});

// 導出路由器類型，供前端使用
export type AppRouter = typeof appRouter;

