"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToStore = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = require("cookie");
const user_model_1 = require("./models/user.model");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
            const cookies = cookieHeader ? (0, cookie_1.parse)(cookieHeader) : {};
            const token = cookies.accessToken || socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Unauthorized - No token provided"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
            const user = await user_model_1.User.findById(decoded._id);
            if (!user) {
                return next(new Error("Unauthorized - User not found"));
            }
            socket.user = user;
            next();
        }
        catch (error) {
            console.error("Socket Auth Error:", error.message);
            next(new Error("Unauthorized - Invalid Token"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.user;
        const storeId = user.storeId?.toString();
        if (storeId) {
            // Join a store-specific room
            socket.join(`store_${storeId}`);
            console.log(`🛡️Socket.IO Connected: ${user.email} → room: store_${storeId}`);
        }
        else {
            // Fallback for users without a store
            socket.join("admin");
            console.log(`🛡️Socket.IO Connected (no store): ${user.email}`);
        }
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
exports.getIO = getIO;
/**
 * Emit an event to a specific store's room or the admin room if no storeId.
 */
const emitToStore = (storeId, event, data) => {
    if (!io)
        return;
    if (storeId) {
        io.to(`store_${storeId}`).emit(event, data);
    }
    else {
        // If no store isolation is active, emit to admin room as fallback
        io.to("admin").emit(event, data);
    }
};
exports.emitToStore = emitToStore;
