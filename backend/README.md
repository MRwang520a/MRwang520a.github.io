# AI Image Platform Backend

這是 mrwang520a.github.io 網站的後端服務，提供六個 AI 圖像處理功能的 API。

## 技術棧

- **框架**: Express 4 + TypeScript
- **API**: tRPC 11（類型安全的端到端 API）
- **數據庫**: MySQL/TiDB + Drizzle ORM
- **認證**: Manus OAuth
- **AI 服務**: 使用內建的圖片生成 API

## 專案結構

```
backend/
├── src/
│   ├── routes/          # tRPC 路由定義
│   │   ├── trpc.ts      # tRPC 基礎配置
│   │   ├── auth.router.ts    # 認證相關路由
│   │   ├── ai.router.ts      # AI 功能路由
│   │   ├── task.router.ts    # 任務管理路由
│   │   ├── quota.router.ts   # 配額管理路由
│   │   └── index.ts          # 主路由器
│   ├── services/        # 業務邏輯服務
│   ├── db/              # 數據庫相關
│   │   ├── config.ts    # 數據庫連接配置
│   │   └── schema.ts    # Drizzle ORM Schema
│   ├── middleware/      # Express 中間件
│   ├── types/           # TypeScript 類型定義
│   │   └── context.ts   # tRPC 上下文類型
│   ├── utils/           # 工具函數
│   └── index.ts         # 服務器入口文件
├── drizzle/             # 數據庫遷移文件
├── .env                 # 環境變數配置
├── .env.example         # 環境變數模板
├── tsconfig.json        # TypeScript 配置
├── drizzle.config.ts    # Drizzle Kit 配置
└── package.json         # 專案依賴
```

## 功能模組

### 1. AI 萬物摳圖 (Matting)
- 智能識別並分離主體與背景
- API: `ai.matting({ imageUrl })`

### 2. AI 產品精修 (Retouch)
- 自動優化光影與細節
- API: `ai.retouch({ imageUrl, options })`

### 3. AI 背景合成 (Background)
- 智能生成精美背景
- API: `ai.background({ imageUrl, prompt })`

### 4. AI 設計師 (Designer)
- 一句話生成圖片
- API: `ai.designer({ prompt, style })`

### 5. AI 通用變清晰 (Upscale)
- 圖像銳化與無損放大
- API: `ai.upscale({ imageUrl, scale })`

### 6. AI 圖片翻譯 (Translate)
- 識別圖片文字與多語言翻譯
- API: `ai.translate({ imageUrl, targetLang })`

## 開發指南

### 環境要求

- Node.js >= 18
- pnpm >= 8
- MySQL >= 8.0 或 TiDB

### 安裝依賴

```bash
cd backend
pnpm install
```

### 配置環境變數

複製 `.env.example` 到 `.env` 並填寫相關配置：

```bash
cp .env.example .env
```

重要配置項：
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: 數據庫連接信息
- `MANUS_CLIENT_ID`, `MANUS_CLIENT_SECRET`: Manus OAuth 憑證
- `OPENAI_API_KEY`: AI 服務 API 密鑰（已自動從環境變數繼承）

### 數據庫遷移

```bash
# 生成遷移文件
pnpm db:generate

# 推送到數據庫
pnpm db:push

# 打開 Drizzle Studio（數據庫可視化工具）
pnpm db:studio
```

### 啟動開發服務器

```bash
pnpm dev
```

服務器將在 `http://localhost:3000` 啟動。

### 構建生產版本

```bash
pnpm build
pnpm start
```

## API 端點

### tRPC 端點

所有 tRPC 端點都在 `/trpc` 路徑下：

- `http://localhost:3000/trpc`

### 健康檢查

- `GET /health` - 檢查服務器狀態

## 數據庫 Schema

### users (用戶表)
- `id`: 用戶唯一標識
- `email`: 用戶郵箱
- `username`: 用戶名
- `avatarUrl`: 頭像 URL
- `oauthProvider`: OAuth 提供商
- `oauthId`: OAuth ID
- `createdAt`: 創建時間
- `updatedAt`: 更新時間

### tasks (任務表)
- `id`: 任務唯一標識
- `userId`: 用戶 ID
- `taskType`: 任務類型（matting, retouch, background, designer, upscale, translate）
- `status`: 任務狀態（pending, processing, completed, failed）
- `inputImageUrl`: 輸入圖片 URL
- `outputImageUrl`: 輸出圖片 URL
- `parameters`: 任務參數（JSON）
- `errorMessage`: 錯誤信息
- `createdAt`: 創建時間
- `completedAt`: 完成時間

### user_quotas (用戶配額表)
- `id`: 配額記錄唯一標識
- `userId`: 用戶 ID
- `quotaType`: 配額類型
- `totalQuota`: 總配額
- `usedQuota`: 已使用配額
- `resetAt`: 重置時間
- `createdAt`: 創建時間
- `updatedAt`: 更新時間

## 待實現功能

- [ ] Manus OAuth 完整實現
- [ ] AI 服務實際對接
- [ ] 圖片上傳功能
- [ ] 任務隊列系統
- [ ] 速率限制
- [ ] 日誌系統
- [ ] 單元測試

## 部署

### 使用 Docker

```bash
# 構建鏡像
docker build -t ai-image-backend .

# 運行容器
docker run -p 3000:3000 --env-file .env ai-image-backend
```

### 使用 PM2

```bash
# 安裝 PM2
npm install -g pm2

# 啟動服務
pm2 start dist/index.js --name ai-image-backend

# 查看日誌
pm2 logs ai-image-backend
```

## 許可證

ISC

