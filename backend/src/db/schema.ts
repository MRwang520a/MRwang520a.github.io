import { mysqlTable, varchar, timestamp, int, text, mysqlEnum, json, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// 用戶表
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  oauthProvider: varchar('oauth_provider', { length: 50 }).default('manus'),
  oauthId: varchar('oauth_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

// 任務類型枚舉
export const taskTypeEnum = mysqlEnum('task_type', [
  'matting',       // AI 萬物摳圖
  'retouch',       // AI 產品精修
  'background',    // AI 背景合成
  'designer',      // AI 設計師
  'upscale',       // AI 通用變清晰
  'translate',     // AI 圖片翻譯
]);

// 任務狀態枚舉
export const taskStatusEnum = mysqlEnum('task_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

// 任務表
export const tasks = mysqlTable('tasks', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  taskType: taskTypeEnum.notNull(),
  status: taskStatusEnum.default('pending'),
  inputImageUrl: varchar('input_image_url', { length: 500 }),
  outputImageUrl: varchar('output_image_url', { length: 500 }),
  parameters: json('parameters'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  statusIdx: index('status_idx').on(table.status),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// 用戶配額表
export const userQuotas = mysqlTable('user_quotas', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  quotaType: varchar('quota_type', { length: 50 }).notNull(),
  totalQuota: int('total_quota').default(0),
  usedQuota: int('used_quota').default(0),
  resetAt: timestamp('reset_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  userQuotaIdx: uniqueIndex('user_quota_idx').on(table.userId, table.quotaType),
}));

// 定義關聯關係
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  quotas: many(userQuotas),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const userQuotasRelations = relations(userQuotas, ({ one }) => ({
  user: one(users, {
    fields: [userQuotas.userId],
    references: [users.id],
  }),
}));

