/**
 * 簡化版 AI 工具包
 * 直接使用 REST API 而不是 tRPC
 */
class SimpleAIToolkit {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * 上傳圖片
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${this.apiBaseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上傳失敗');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('上傳失敗');
    }
  }

  /**
   * 生成圖片（AI 設計師）
   */
  async generateImage(prompt, style) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/designer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, style }),
      });

      if (!response.ok) {
        throw new Error('生成失敗');
      }

      const data = await response.json();
      return data.taskId;
    } catch (error) {
      console.error('Generate error:', error);
      throw new Error('生成失敗');
    }
  }
}

// 導出全局實例
window.simpleAI = new SimpleAIToolkit('https://3000-ic7ihpcd2pniba0bfla4m-85c31e9d.manusvm.computer');

