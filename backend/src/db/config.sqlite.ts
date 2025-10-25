import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.sqlite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// 創建 SQLite 數據庫文件路徑
const dbPath = path.join(process.cwd(), 'data', 'ai_platform.db');

// 確保數據目錄存在
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 創建 SQLite 連接
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL'); // 啟用 WAL 模式以提高性能

// 創建 Drizzle ORM 實例
export const db = drizzle(sqlite, { schema });

// 測試數據庫連接
export function testConnection() {
  try {
    const result = sqlite.prepare('SELECT 1 as test').get();
    console.log('✅ SQLite database connection successful');
    console.log(`📁 Database file: ${dbPath}`);
    return true;
  } catch (error) {
    console.error('❌ SQLite database connection failed:', error);
    return false;
  }
}

export { sqlite };

