// models/Teacher.js
import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true,
    },
    teacherId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    profileImage: {
      type: String,
      default: null, // Cloudinary URL
    },
    role: {
      type: String,
      default: 'teacher',
    },
     
  },
  { timestamps: true }
);

export default mongoose.model('Teacher', teacherSchema);