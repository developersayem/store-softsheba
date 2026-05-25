import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { User } from "./models/user.model";

let io: Server;
export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : ["http://localhost:3000"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = cookieHeader ? parse(cookieHeader) : {};
      const token = cookies.accessToken || socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Unauthorized - No token provided"));
      }
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET as string
      );
      const user = await User.findById(decoded._id);
      if (!user) {
        return next(new Error("Unauthorized - User not found"));
      }
      (socket as any).user = user;
      next();
    } catch (error: any) {
      console.error("Socket Auth Error:", error.message);
      next(new Error("Unauthorized - Invalid Token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    const storeId = user.storeId?.toString();

    if (storeId) {
      // Join a store-specific room
      socket.join(`store_${storeId}`);
      console.log(
        `🛡️Socket.IO Connected: ${user.email} → room: store_${storeId}`
      );
    } else {
      // Fallback for users without a store
      socket.join("admin");
      console.log(
        `🛡️Socket.IO Connected (no store): ${user.email}`
      );
    }
  });
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

/**
 * Emit an event to a specific store's room or the admin room if no storeId.
 */
export const emitToStore = (
  storeId: string | undefined,
  event: string,
  data: any,
) => {
  if (!io) return;
  if (storeId) {
    io.to(`store_${storeId}`).emit(event, data);
  } else {
    // If no store isolation is active, emit to admin room as fallback
    io.to("admin").emit(event, data);
  }
};
