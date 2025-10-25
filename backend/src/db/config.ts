import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// 創建 MySQL 連接池
const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_image_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 創建 Drizzle ORM 實例
export const db = drizzle(poolConnection, { schema, mode: 'default' });

// 測試數據庫連接
export async function testConnection() {
  try {
    const connection = await poolConnection.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export { poolConnection };

