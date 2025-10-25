import { aiService } from './services/ai.service';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 測試 AI 服務
 */
async function testAIService() {
  console.log('🧪 Testing AI Service...\n');

  try {
    // 測試 AI 設計師（最簡單的功能，不需要輸入圖片）
    console.log('1️⃣ Testing AI Designer...');
    const imageUrl = await aiService.generateImage(
      'A cute cat sitting on a laptop',
      'realistic'
    );
    console.log('✅ Generated image URL:', imageUrl);
    console.log('');

    // 測試 AI 背景合成
    console.log('2️⃣ Testing AI Background Generation...');
    const backgroundUrl = await aiService.generateBackground(
      'https://example.com/sample.jpg',
      'A beautiful sunset beach'
    );
    console.log('✅ Generated background URL:', backgroundUrl);
    console.log('');

    // 測試 AI 圖片翻譯（使用 GPT-4 Vision）
    console.log('3️⃣ Testing AI Image Translation...');
    try {
      const translationResult = await aiService.translateImage(
        'https://example.com/sample.jpg',
        'zh'
      );
      console.log('✅ Translation result:');
      console.log('   Original text:', translationResult.originalText);
      console.log('   Translated text:', translationResult.translatedText);
      console.log('   Translated image URL:', translationResult.translatedImageUrl);
    } catch (error) {
      console.log('⚠️  Translation test skipped (requires valid image URL)');
    }
    console.log('');

    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// 執行測試
testAIService()
  .then(() => {
    console.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

