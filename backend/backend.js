import express  from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import groupRoute from './routes/group.route.js';
import cookieParser from 'cookie-parser';
import connectionDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import teacherR from './routes/teacher.route.js'
 
  dotenv.config();
connectionDB();

const app = express();

app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

console.log('🔥 BACKEND FILE LOADED');
 
app.use('/',authRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/student",authRoutes);
app.use('/group',groupRoute)
app.use('/teacher',teacherR)



 
//const PORT = process.env.PORT  
app.listen(4002,()=>{

console.log("Server running at ",4002," Sucessfully");
});
 