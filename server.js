const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime');

const app = express();
const upload = multer({ dest: 'uploads/' });

// 創建上傳目錄
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// 中間件
app.use(express.json());
app.use(express.static('public'));

// 模擬用戶權限數據
const userPermissions = {
  'user1': { canUpload: true },
  'user2': { canUpload: false }
};

// 檢查上傳權限
app.post('/api/check-permission', (req, res) => {
  const userId = req.body.userId || 'user1'; // 這裡應該從LINE獲取實際用戶ID
  const permission = userPermissions[userId] || { canUpload: false };
  res.json({ hasPermission: permission.canUpload });
});

// 文件上傳
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    const files = req.files.map(file => {
      const newPath = path.join('uploads', file.originalname);
      fs.renameSync(file.path, newPath);
      return {
        name: file.originalname,
        url: `/uploads/${file.originalname}`,
        type: file.mimetype
      };
    });

    res.json({ success: true, files });
  } catch (error) {
    console.error('上傳失敗:', error);
    res.status(500).json({ success: false });
  }
});

// 獲取文件列表
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync('uploads').map(file => {
      const filePath = path.join('uploads', file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        url: `/uploads/${file}`,
        type: mime.getType(filePath) || 'application/octet-stream',
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    res.json(files);
  } catch (error) {
    console.error('獲取文件列表失敗:', error);
    res.status(500).json([]);
  }
});

// 提供上傳文件
app.use('/uploads', express.static('uploads'));

// 啟動服務器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
