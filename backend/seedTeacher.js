import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Teacher from './models/TeacherModel.js';

dotenv.config();

await mongoose.connect('mongodb://127.0.0.1:27017/fypBD');
const existing = await Teacher.findOne({ email: 'ctect8868@gmail.com' });
if (!existing) {
  const hashedPassword = await bcrypt.hash('teacher123', 12);
  await Teacher.create({
    name: 'Dr. Alice Smith',
    email: 'ctech8868@gmail.com',
    password: hashedPassword,
    teacherId: 'T2024001',
    subject: 'Computer Science',
    department: 'CS',
    qualification: 'PhD',
    experience: 10,
    profileImage: null,
    role: 'teacher'
  });
  console.log('Teacher seeded');
}
process.exit();