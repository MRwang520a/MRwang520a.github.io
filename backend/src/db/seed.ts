import { db } from './config.sqlite';
import { users, userQuotas } from './schema.sqlite';
import { v4 as uuidv4 } from 'uuid';

/**
 * 數據庫初始化腳本
 * 創建測試用戶和初始配額
 */
async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 創建測試用戶
    const testUserId = uuidv4();
    const testUser = {
      id: testUserId,
      email: 'test@example.com',
      username: 'Test User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      oauthProvider: 'manus',
      oauthId: 'test_oauth_id',
    };

    console.log('👤 Creating test user...');
    await db.insert(users).values(testUser);
    console.log(`✅ Test user created: ${testUser.email}`);

    // 為測試用戶創建配額
    const quotaTypes = [
      { type: 'matting', total: 100 },
      { type: 'retouch', total: 50 },
      { type: 'background', total: 50 },
      { type: 'designer', total: 30 },
      { type: 'upscale', total: 100 },
      { type: 'translate', total: 50 },
    ];

    console.log('📊 Creating user quotas...');
    for (const quota of quotaTypes) {
      await db.insert(userQuotas).values({
        id: uuidv4(),
        userId: testUserId,
        quotaType: quota.type,
        totalQuota: quota.total,
        usedQuota: 0,
        resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 天後重置
      });
      console.log(`  ✓ ${quota.type}: ${quota.total} credits`);
    }

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📝 Test User Credentials:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   User ID: ${testUserId}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// 執行 seed
seed()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });

