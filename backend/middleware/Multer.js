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
    path.join(__dirname, '../uploads/projects') // For project PDFs
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

// Storage for PDF files (your existing one)
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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

// PDF file filter (your existing one)
const pdfFilter = (req, file, cb) => {
  const allowed = /pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Create multer instances
const uploadMemberImage = multer({
  storage: memberStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter
});

const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter
});

// Export both upload middlewares
export const upload = {
  memberImage: uploadMemberImage.single('image'),  // For single member image
  pdf: uploadPdf.single('pdf'),                    // For single PDF file
  memberImages: uploadMemberImage.array('images', 5), // For multiple images
  pdfs: uploadPdf.array('pdfs', 3)                   // For multiple PDFs
};

// For backward compatibility (your existing export)
export const pdfUpload = uploadPdf.single('pdf');
export const memberImageUpload = uploadMemberImage.single('image');