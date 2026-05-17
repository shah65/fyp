import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import groupRoute from './routes/group.route.js';
import cookieParser from 'cookie-parser';
import connectionDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import teacherR from './routes/teacher.route.js';
import projectRoutes from './routes/projectRoutes.js'
import meetingRoute from './routes/meetingRoute.js'
import { setIO } from './utils/socketUtil.js';
import blockchainRoutes from './routes/blockchainRoute.js'

dotenv.config();
connectionDB();

const app = express();

// More permissive CORS for development
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

 
app.use('/', authRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/student", authRoutes);
app.use('/group', groupRoute);
app.use('/teacher', teacherR);
app.use('/api/student',projectRoutes)
app.use('/api', meetingRoute); // Add meeting routes
app.use('/api/blockchain', blockchainRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Set the io instance in the utility
setIO(io);

// Socket.io authentication middleware (using JWT, matching your login system)
io.use((socket, next) => {
  const token = socket.handshake.auth.token; // Client sends token in auth
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Invalid token'));
    }
    socket.user = decoded; // { id, email, role }
    next();
  });
});

// Handle connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id} (${socket.user.role})`);
  socket.join(socket.user.id.toString()); // Join a room named after user ID for private notifications

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Attach io to app for access in controllers
app.set('io', io);

server.listen(4002, () => {
  console.log("Server running at 4002 Successfully");
})