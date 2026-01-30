import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination:(req,file,cb) =>{
    cb(null,'uploads/');
  },
  filename:(req,file,cb) =>{
    cb(null,Date.now()+path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) =>{
  const allowed = /pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null,true);
  else cb (new Error ("Only PDF file are allowed"),false);
};
export const upload = multer ({storage,fileFilter});