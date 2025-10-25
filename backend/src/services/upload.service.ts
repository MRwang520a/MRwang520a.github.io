import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 確保上傳目錄存在
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// 文件過濾器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 只允許圖片文件
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'));
  }
};

// 創建 multer 實例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 默認 10MB
  },
});

/**
 * 圖片上傳服務類
 */
export class UploadService {
  /**
   * 獲取上傳文件的公開 URL
   */
  getFileUrl(filename: string): string {
    // 在生產環境中，這應該返回 CDN 或靜態文件服務器的 URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }

  /**
   * 刪除上傳的文件
   */
  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  /**
   * 清理過期的文件（超過 24 小時）
   */
  async cleanupOldFiles(): Promise<void> {
    const files = await fs.promises.readdir(uploadDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 小時

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.promises.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await fs.promises.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  }
}

// 導出單例
export const uploadService = new UploadService();

