"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockIPMiddleware = void 0;
const block_ip_model_1 = require("../models/block.ip.model");
const blockIPMiddleware = async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;
    if (!ip)
        return next();
    const blocked = await block_ip_model_1.BlockedIP.findOne({ ip }).lean();
    if (blocked) {
        return res.status(403).json({
            success: false,
            message: "Your IP has been blocked",
        });
    }
    next();
};
exports.blockIPMiddleware = blockIPMiddleware;
