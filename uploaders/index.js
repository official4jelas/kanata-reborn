import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 30002;

// Change to a permanent directory to store files
const uploadDir = path.join(__dirname, 'tmp');

// Configure Multer for permanent storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Directly save files in the 'tmp' directory without creating subfolders
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique file name with timestamp
    const timestamp = Date.now();
    const uniqueId = nanoid(10);
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace non-alphanumeric characters with dash
      .toLowerCase();
    
    const finalName = `${safeName}-${timestamp}-${uniqueId}${ext}`;
    cb(null, finalName);
  }
});

// Configure allowed file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    // Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
    // Archives
    '.zip', '.rar', '.7z', '.tar', '.gz'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format! Only image, document, and archive files are allowed.'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Limit file size to 50MB
  }
});

// Function to create a public URL from file path
function createPublicUrl(req, filePath) {
  const relativePath = path.relative(uploadDir, filePath);
  return `${req.protocol}://${req.get('host')}/uploads/${relativePath.replace(/\\/g, '/')}`;
}

// Inisialisasi database SQLite
const db = new sqlite3.Database('./uploads.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      originalName TEXT,
      filename TEXT,
      path TEXT,
      size INTEGER,
      mimetype TEXT,
      uploadDate TEXT,
      url TEXT
    )`);
  }
});

// Endpoint untuk mengupload file
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File not found in request!',
      });
    }

    // Create public URL to access the file
    const fileUrl = createPublicUrl(req, req.file.path);

    // Save file information to log (optional)
    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date().toISOString(),
      url: fileUrl
    };

    // Simpan informasi file ke database
    db.run(`INSERT INTO files (originalName, filename, path, size, mimetype, uploadDate, url) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
      [fileInfo.originalName, fileInfo.filename, fileInfo.path, fileInfo.size, fileInfo.mimetype, fileInfo.uploadDate, fileInfo.url], 
      function(err) {
        if (err) {
          console.error('Error inserting file info into database: ' + err.message);
        }
      }
    );

    res.status(200).json({
      success: true,
      message: fileUrl,
      fileInfo: fileInfo // Optional: send file info to client
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: `An error occurred: ${error.message}`,
    });
  }
});

// Endpoint untuk mendapatkan daftar file yang diupload
app.get('/files', (req, res) => {
  db.all(`SELECT * FROM files`, [], (err, rows) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: `Error retrieving files: ${err.message}`
      });
      return;
    }
    res.json({
      success: true,
      data: rows
    });
  });
});

// Middleware to serve static files
app.use('/uploads', express.static(uploadDir));

// Fungsi untuk menghitung penggunaan disk
function calculateDiskUsage(dirPath) {
  let totalSize = 0;
  let fileCount = 0;

  function calculateDirSize(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        calculateDirSize(filePath);
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    });
  }

  calculateDirSize(dirPath);
  return { totalSize, fileCount };
}

// Endpoint untuk mendapatkan penggunaan disk
app.get('/maintenance/disk-usage', (req, res) => {
  try {
    const { totalSize, fileCount } = calculateDiskUsage(uploadDir);
    res.json({
      success: true,
      data: {
        totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
        fileCount: fileCount,
        uploadDir: uploadDir
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error getting disk usage: ${error.message}`
    });
  }
});

// Add error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred'
  });
});

// Fungsi untuk menampilkan halaman utama
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Modern File Uploader</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
        :root {
          --primary-color: #4f46e5;
          --primary-hover: #4338ca;
          --bg-color: #f3f4f6;
          --card-bg: #ffffff;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --error-color: #ef4444;
          --success-color: #22c55e;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-color);
          color: var(--text-primary);
          line-height: 1.6;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          width: 100%;
          max-width: 900px;
          background: var(--card-bg);
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          padding: 2rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .subheader {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .upload-area {
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          background: #fafafa;
          position: relative;
          margin-bottom: 1.5rem;
        }

        .upload-area.drag-over {
          border-color: var(--primary-color);
          background: #f8fafc;
        }

        .upload-icon {
          font-size: 3rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .upload-text {
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .browse-text {
          color: var(--primary-color);
          font-weight: 500;
          cursor: pointer;
        }

        .file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0;
          cursor: pointer;
        }

        .selected-file {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .upload-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s ease;
          width: 100%;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .upload-btn:hover {
          background: var(--primary-hover);
        }

        .upload-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .info-section {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .info-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .info-list {
          list-style: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .info-list li {
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-list i {
          color: var(--primary-color);
          font-size: 0.75rem;
        }

        #result {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          display: none;
        }

        #result.success {
          background: #f0fdf4;
          color: var(--success-color);
          display: block;
        }

        #result.error {
          background: #fef2f2;
          color: var(--error-color);
          display: block;
        }

        .result-link {
          color: var(--primary-color);
          text-decoration: none;
          word-break: break-all;
        }

        .result-link:hover {
          text-decoration: underline;
        }

        .upload-progress {
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          margin-top: 1rem;
          overflow: hidden;
          display: none;
        }

        .progress-bar {
          height: 100%;
          background: var(--primary-color);
          width: 0%;
          transition: width 0.3s ease;
        }

        @media (max-width: 640px) {
          .container {
            padding: 1rem;
          }

          h1 {
            font-size: 1.75rem;
          }

          .upload-area {
            padding: 1.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Modern File Uploader</h1>
          <p class="subheader">Upload your files securely and easily</p>
        </div>

        <form id="uploadForm">
          <div class="upload-area" id="uploadArea">
            <i class="fas fa-cloud-upload-alt upload-icon"></i>
            <div class="upload-text">
              <p>Drag and drop your file here or</p>
              <span class="browse-text">browse files</span>
            </div>
            <input type="file" id="file" name="file" class="file-input" required>
            <div class="selected-file" id="selectedFileName"></div>
          </div>

          <button type="submit" class="upload-btn" id="uploadBtn" disabled>
            <i class="fas fa-upload"></i>
            Upload File
          </button>

          <div class="upload-progress" id="uploadProgress">
            <div class="progress-bar" id="progressBar"></div>
          </div>

          <div class="info-section">
            <div class="info-title">Supported Files</div>
            <ul class="info-list">
              <li><i class="fas fa-image"></i> Images: JPG, PNG, GIF, BMP, WebP</li>
              <li><i class="fas fa-file-alt"></i> Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT</li>
              <li><i class="fas fa-file-archive"></i> Archives: ZIP, RAR, 7Z, TAR, GZ</li>
              <li><i class="fas fa-exclamation-circle"></i> Maximum file size: 50MB</li>
            </ul>
          </div>

          <div id="result"></div>
        </form>
      </div>

      <script>
        const form = document.getElementById('uploadForm');
        const result = document.getElementById('result');
        const fileInput = document.getElementById('file');
        const selectedFileName = document.getElementById('selectedFileName');
        const uploadArea = document.getElementById('uploadArea');
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');

        function formatFileSize(bytes) {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            selectedFileName.innerHTML = \`
              <i class="fas fa-file"></i>
              \${file.name} (\${formatFileSize(file.size)})
            \`;
            uploadBtn.disabled = false;
          } else {
            selectedFileName.textContent = '';
            uploadBtn.disabled = true;
          }
        });

        uploadArea.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', (e) => {
          e.preventDefault();
          uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadArea.classList.remove('drag-over');
          const file = e.dataTransfer.files[0];
          if (file) {
            fileInput.files = e.dataTransfer.files;
            selectedFileName.innerHTML = \`
              <i class="fas fa-file"></i>
              \${file.name} (\${formatFileSize(file.size)})
            \`;
            uploadBtn.disabled = false;
          }
        });

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData();
          const file = fileInput.files[0];

          if (file.size > 50 * 1024 * 1024) {
            result.className = 'error';
            result.innerHTML = '<i class="fas fa-exclamation-circle"></i> File size exceeds 50MB limit!';
            return;
          }

          formData.append('file', file);
          uploadBtn.disabled = true;
          uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
          uploadProgress.style.display = 'block';
          result.style.display = 'none';

          try {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percentage = (event.loaded / event.total) * 100;
                progressBar.style.width = percentage + '%';
              }
            };

            xhr.onload = function() {
              uploadProgress.style.display = 'none';
              uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload File';
              uploadBtn.disabled = false;

              const response = JSON.parse(xhr.response);
              
              if (response.success) {
                result.className = 'success';
                result.innerHTML = \`
                  <i class="fas fa-check-circle"></i> File uploaded successfully!<br>
                  <a href="\${response.message}" target="_blank" class="result-link">
                    <i class="fas fa-external-link-alt"></i> \${response.message}
                  </a>
                \`;
              } else {
                result.className = 'error';
                result.innerHTML = \`<i class="fas fa-exclamation-circle"></i> \${response.message}\`;
              }
            };

            xhr.onerror = function() {
              uploadProgress.style.display = 'none';
              uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload File';
              uploadBtn.disabled = false;
              result.className = 'error';
              result.innerHTML = '<i class="fas fa-exclamation-circle"></i> An error occurred during upload';
            };

            xhr.open('POST', '/upload', true);
            xhr.send(formData);
          } catch (error) {
            uploadProgress.style.display = 'none';
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload File';
            uploadBtn.disabled = false;
            result.className = 'error';
            result.innerHTML = \`<i class="fas fa-exclamation-circle"></i> \${error.message}\`;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// API Documentation
app.get('/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Upload Documentation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #f0f2f5;
        }
        .container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        pre {
          background: #f6f8fa;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
        }
        .endpoint {
          margin-bottom: 30px;
        }
        .method {
          color: #fff;
          background: #1a73e8;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>API Upload Documentation</h1>
        
        <div class="endpoint">
          <h2>Upload File</h2>
          <p><span class="method">POST</span> /upload</p>
          <h3>Request</h3>
          <p>Content-Type: multipart/form-data</p>
          <pre>
{
  "file": "(file binary)"
}
          </pre>
          
          <h3>Response Success</h3>
          <pre>
{
  "success": true,
  "message": "cdn.roidev.my.id/uploads/filename.ext"
}
          </pre>
          
          <h3>Response Error</h3>
          <pre>
{
  "success": false,
  "message": "Error message"
}
          </pre>
          
          <h3>Limitations</h3>
          <ul>
            <li>Maximum file size: 50MB</li>
            <li>Supported formats:
              <ul>
                <li>Images: jpg, jpeg, png, gif, bmp, webp</li>
                <li>Documents: pdf, doc, docx, xls, xlsx, ppt, pptx, txt</li>
                <li>Archives: zip, rar, 7z, tar, gz</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Handle 404 Error
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page Not Found</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #f0f2f5;
          text-align: center;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-top: 50px;
        }
        h1 {
          color: #1a73e8;
          font-size: 48px;
          margin: 0;
        }
        p {
          color: #666;
          margin: 20px 0;
        }
        a {
          color: #1a73e8;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <p>Sorry, the page you are looking for could not be found.</p>
        <a href="/">Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// Menutup koneksi database saat server dimatikan
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database: ' + err.message);
    }
    process.exit(0);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});