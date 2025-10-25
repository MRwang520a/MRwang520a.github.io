import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { upload, uploadService } from './services/upload.service';
import path from 'path';
import { appRouter } from './routes';
import { createContext } from './types/context.sqlite';
import { testConnection } from './db/config.sqlite';

// 加載環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件配置
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS 配置
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // 允許沒有 origin 的請求（例如移動應用或 Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 小時
  },
}));

// 靜態文件服務（上傳的圖片）
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 文件上傳端點
app.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = uploadService.getFileUrl(req.file.filename);
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
  });
});

// 健康檢查端點
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'SQLite',
  });
});

// tRPC 中間件
app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext,
  onError: ({ path, error }) => {
    console.error(`❌ tRPC Error on ${path}:`, error);
  },
}));

// 404 處理
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// 全局錯誤處理
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 啟動服務器
async function startServer() {
  try {
    // 測試數據庫連接
    console.log('🔍 Testing database connection...');
    const dbConnected = testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed, but server will start anyway');
    }

    // 啟動 HTTP 服務器
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Server is running!');
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🔌 tRPC: http://localhost:${PORT}/trpc`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: SQLite`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 處理未捕獲的異常
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// 啟動服務器
startServer();

