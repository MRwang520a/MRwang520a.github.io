import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// 用戶表
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username'),
  avatarUrl: text('avatar_url'),
  oauthProvider: text('oauth_provider').default('manus'),
  oauthId: text('oauth_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

// 任務表
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskType: text('task_type', { 
    enum: ['matting', 'retouch', 'background', 'designer', 'upscale', 'translate'] 
  }).notNull(),
  status: text('status', { 
    enum: ['pending', 'processing', 'completed', 'failed'] 
  }).default('pending'),
  inputImageUrl: text('input_image_url'),
  outputImageUrl: text('output_image_url'),
  parameters: text('parameters', { mode: 'json' }),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  statusIdx: index('status_idx').on(table.status),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// 用戶配額表
export const userQuotas = sqliteTable('user_quotas', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quotaType: text('quota_type').notNull(),
  totalQuota: integer('total_quota').default(0),
  usedQuota: integer('used_quota').default(0),
  resetAt: integer('reset_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  userQuotaIdx: index('user_quota_idx').on(table.userId, table.quotaType),
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

