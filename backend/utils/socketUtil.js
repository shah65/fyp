let io;

export const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, { cors: { origin: '*' } });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const setIO = (instance) => {
  io = instance;
};