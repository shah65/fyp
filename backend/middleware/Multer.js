import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories if they don't exist
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/members'),  // For member images
    path.join(__dirname, '../uploads/projects'), // For project PDFs
    path.join(__dirname, '../uploads/videos')    // For project videos
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

createDirectories();

// Storage for member images
const memberStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/members/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `member-${uniqueSuffix}${ext}`);
  }
});

// Storage for PDF files
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `project-${uniqueSuffix}${ext}`);
  }
});

// FIXED: Video Storage configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/'); // Added trailing slash
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`); // Fixed: cd -> cb
  }
});

// Image file filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG) are allowed'), false);
  }
};

// PDF file filter
const pdfFilter = (req, file, cb) => {
  const allowed = /pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';

  if (ext && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Video file filter
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|webm|mov|quicktime/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, WebM, MOV) are allowed'), false);
  }
};

// Create multer instances
const uploadMemberImage = multer({
  storage: memberStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
  fileFilter: imageFilter
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for PDFs
  fileFilter: pdfFilter
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: videoFilter
});

// Export all upload middlewares
export const upload = {
  memberImage: uploadMemberImage.single('image'),
  memberImages: uploadMemberImage.array('images', 5),
  pdf: uploadPdf.single('pdf'),
  pdfs: uploadPdf.array('pdfs', 3),
  video: uploadVideo.single('video'),
  videos: uploadVideo.array('videos', 1)
};

// For backward compatibility - FIXED: These should be functions, not properties
export const pdfUpload = (fieldName = 'pdf') => uploadPdf.single(fieldName);
export const memberImageUpload = (fieldName = 'image') => uploadMemberImage.single(fieldName);
export const videoUpload = (fieldName = 'video') => uploadVideo.single(fieldName);