import "dotenv/config";
import { Server } from "socket.io";

let _io = null;

export const init = (httpServer) =>
  (_io ??= new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  }));

export const getIO = () => {
  if (!_io)
    throw new Error(
      "[socketManager] Socket.io no inicializado. Llama init(httpServer) primero.",
    );
  return _io;
};
