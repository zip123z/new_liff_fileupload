require('dotenv').config();

// LIFF初始化
async function initializeLiff() {
  try {
    // 初始化LIFF
    const liffId = process.env.LIFF_ID;
    if (!liffId) {
      throw new Error('LIFF_ID環境變數未設置');
    }
    
    await liff.init({ liffId });

    // 檢查是否登入
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    // 獲取用戶資料
    const profile = await liff.getProfile();
    const context = liff.getContext();

    // 檢查權限
    const hasUploadPermission = await checkUploadPermission(profile.userId);
    toggleUploadSection(hasUploadPermission);

    // 初始化完成
    console.log('LIFF initialized successfully');
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    showError('初始化失敗，請稍後再試');
  }
}

// 檢查上傳權限
async function checkUploadPermission(userId) {
  // 這裡可以根據實際需求實現權限檢查
  // 例如：調用後端API檢查用戶權限
  return true; // 暫時返回true
}

// 切換上傳區塊顯示
function toggleUploadSection(hasPermission) {
  const uploadSection = document.getElementById('uploadSection');
  if (hasPermission) {
    uploadSection.classList.remove('hidden');
  } else {
    uploadSection.classList.add('hidden');
  }
}

// 顯示錯誤訊息
function showError(message) {
  alert(message);
}

// 啟動
window.addEventListener('load', () => {
  initializeLiff();
});
