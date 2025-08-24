import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file per request
  }
});

// Middleware for single file upload
export const uploadSingle = upload.single('image');

// Middleware for handling upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only 1 file allowed.'
      });
    }
  }
  
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Helper function to get file URL
export const getFileUrl = (filename) => {
  if (!filename) return null;
  return `/uploads/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filename) => {
  if (!filename) return;
  
  const filePath = path.join(__dirname, '../uploads/', filename);
  import('fs').then(fs => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });
  });
};
