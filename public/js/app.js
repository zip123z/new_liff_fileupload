let liffId = '2006561793-QmrJmxR4'; // 替換為用戶提供的LIFF ID

async function initializeLiff() {
  try {
    await liff.init({ liffId });
    if (!liff.isLoggedIn()) {
      liff.login();
    }
    return liff.getProfile();
  } catch (error) {
    console.error('LIFF初始化失敗:', error);
    return null;
  }
}

// 立即顯示文件列表
renderFileList([]);

document.addEventListener('DOMContentLoaded', async () => {
  // 初始加載文件列表
  loadFileList();
  const profile = await initializeLiff();
  if (!profile) {
    alert('LINE登入失敗，請重新載入頁面');
    return;
  }
  const uploadSection = document.getElementById('upload-section');
  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.getElementById('file-input');
  const fileTableBody = document.querySelector('#file-table tbody');

  // 檢查用戶權限
  checkPermission().then(hasPermission => {
    if (hasPermission) {
      uploadSection.classList.remove('hidden');
    }
  });

  // 登入後刷新文件列表
  loadFileList();

  // 處理文件上傳
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (fileInput.files.length === 0) {
      alert('請選擇要上傳的文件');
      return;
    }

    const formData = new FormData();
    for (const file of fileInput.files) {
      formData.append('files', file);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        alert('文件上傳成功');
        loadFileList();
        fileInput.value = ''; // 清空文件選擇
      } else {
        throw new Error('文件上傳失敗');
      }
    } catch (error) {
      console.error('上傳錯誤:', error);
      alert('文件上傳失敗，請稍後再試');
    }
  });

  // 檢查用戶權限
  async function checkPermission() {
    try {
      const response = await fetch('/api/check-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: profile.userId
        })
      });
      const data = await response.json();
      return data.hasPermission;
    } catch (error) {
      console.error('權限檢查失敗:', error);
      return false;
    }
  }

  // 加載文件列表
  async function loadFileList() {
    try {
      const response = await fetch('/api/files');
      const files = await response.json();
      renderFileList(files);
    } catch (error) {
      console.error('獲取文件列表失敗:', error);
      // 即使獲取失敗也顯示空列表
      renderFileList([]);
    }
  }

  // 渲染文件列表
  function renderFileList(files) {
    fileTableBody.innerHTML = files.map(file => `
      <tr>
        <td>${file.name}</td>
        <td>${file.type}</td>
        <td>${formatFileSize(file.size)}</td>
        <td>${new Date(file.createdAt).toLocaleString()}</td>
        <td>
          ${file.type.startsWith('image/') ? 
            `<a href="${file.url}" class="file-action" target="_blank">查看</a>` : 
            `<a href="${file.url}" class="file-action" download>下載</a>`
          }
        </td>
      </tr>
    `).join('');
  }

  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
});
