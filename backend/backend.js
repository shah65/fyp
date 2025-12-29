import express  from 'express';
// import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectionDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

//  dotenv.config();
connectionDB();

const app = express();

app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
//app.use(cookieParser())

console.log('🔥 BACKEND FILE LOADED');
// app.get('/',(req,res)=>{
//   res.send('hy therer7tiukgjhgfsrhtejr')
//   console.log('url is', req.method, req.url);
  
// })
app.use('/',authRoutes);
 
// app.get('/',(req,res)=>{
//   res.send('hy')
//   console.log('url is', req.method, req.url);
  
// })
//const PORT = process.env.PORT  
app.listen(4002,()=>{

console.log("Server running at ",4002," Sucessfully");
});
 