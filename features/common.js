// 通用 JavaScript 功能

// API 配置
const API_BASE_URL = 'https://3000-ic7ihpcd2pniba0bfla4m-85c31e9d.manusvm.computer';

// 工具函數
class AIToolkit {
  constructor() {
    this.taskId = null;
    this.pollInterval = null;
  }

  // 上傳圖片
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
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
      throw error;
    }
  }

  // 創建任務
  async createTask(endpoint, params) {
    try {
      const response = await fetch(`${API_BASE_URL}/trpc/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('任務創建失敗');
      }

      const data = await response.json();
      this.taskId = data.result.data.taskId;
      return this.taskId;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  // 查詢任務狀態
  async getTaskStatus(taskId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/trpc/ai.getTaskStatus?input=${encodeURIComponent(
          JSON.stringify({ taskId })
        )}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('查詢任務狀態失敗');
      }

      const data = await response.json();
      return data.result.data;
    } catch (error) {
      console.error('Get task status error:', error);
      throw error;
    }
  }

  // 輪詢任務狀態
  async pollTaskStatus(taskId, onUpdate, onComplete, onError) {
    this.pollInterval = setInterval(async () => {
      try {
        const status = await this.getTaskStatus(taskId);

        // 更新回調
        if (onUpdate) {
          onUpdate(status);
        }

        // 任務完成
        if (status.status === 'completed') {
          clearInterval(this.pollInterval);
          if (onComplete) {
            onComplete(status);
          }
        }

        // 任務失敗
        if (status.status === 'failed') {
          clearInterval(this.pollInterval);
          if (onError) {
            onError(status.errorMessage || '任務處理失敗');
          }
        }
      } catch (error) {
        clearInterval(this.pollInterval);
        if (onError) {
          onError(error.message);
        }
      }
    }, 2000); // 每 2 秒查詢一次
  }

  // 停止輪詢
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // 下載圖片
  async downloadImage(url, filename) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'processed-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
}

// 文件上傳處理
class FileUploadHandler {
  constructor(uploadAreaId, onFileSelected) {
    this.uploadArea = document.getElementById(uploadAreaId);
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.style.display = 'none';
    document.body.appendChild(this.fileInput);

    this.onFileSelected = onFileSelected;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 點擊上傳
    this.uploadArea.addEventListener('click', () => {
      this.fileInput.click();
    });

    // 文件選擇
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    });

    // 拖拽上傳
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('dragover');
    });

    this.uploadArea.addEventListener('dragleave', () => {
      this.uploadArea.classList.remove('dragover');
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('dragover');

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleFile(file);
      }
    });
  }

  handleFile(file) {
    // 驗證文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超過 10MB');
      return;
    }

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片文件');
      return;
    }

    // 預覽圖片
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.onFileSelected) {
        this.onFileSelected(file, e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }
}

// UI 工具函數
const UIUtils = {
  // 顯示狀態消息
  showMessage(message, type = 'info') {
    const existingMessage = document.querySelector('.status-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `status-message ${type}`;
    messageEl.textContent = message;

    const container = document.querySelector('.container');
    container.appendChild(messageEl);

    // 3 秒後自動移除
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  },

  // 顯示加載狀態
  showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="loading"></span> 處理中...';
    }
  },

  // 隱藏加載狀態
  hideLoading(buttonId, text = '開始處理') {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.innerHTML = text;
    }
  },

  // 更新進度條
  updateProgress(percentage) {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
  },

  // 顯示/隱藏元素
  show(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('hidden');
    }
  },

  hide(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('hidden');
    }
  },
};

// 導出全局對象
window.AIToolkit = AIToolkit;
window.FileUploadHandler = FileUploadHandler;
window.UIUtils = UIUtils;

