// 自動將主頁的 AI 功能按鈕鏈接指向對應的子頁面
(function() {
    'use strict';
    
    // 等待頁面完全加載
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('正在修改 AI 功能鏈接...');
        
        // 功能映射表
        const featureMap = {
            '萬物摳圖': '/features/matting.html',
            '產品精修': '/features/retouch.html',
            '背景合成': '/features/background.html',
            '設計師': '/features/designer.html',
            '通用變清晰': '/features/upscale.html',
            '圖片翻譯': '/features/translate.html'
        };
        
        // 查找所有可能的按鈕和鏈接
        const allLinks = document.querySelectorAll('a, button, div[onclick], span[onclick]');
        
        allLinks.forEach(element => {
            const text = element.textContent || element.innerText || '';
            
            // 檢查文本中是否包含 AI 功能關鍵詞
            for (const [keyword, url] of Object.entries(featureMap)) {
                if (text.includes(keyword) || text.includes('AI ' + keyword) || text.includes('AI' + keyword)) {
                    // 修改鏈接
                    if (element.tagName === 'A') {
                        element.href = url;
                        element.target = '_blank';
                    } else {
                        // 為非 a 標籤添加點擊事件
                        element.style.cursor = 'pointer';
                        element.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(url, '_blank');
                        });
                    }
                    console.log(`已修改: ${keyword} -> ${url}`);
                }
            }
        });
        
        console.log('AI 功能鏈接修改完成！');
    }
})();

