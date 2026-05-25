"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./db/index"));
const logger_1 = __importDefault(require("./utils/logger"));
const app_1 = require("./app");
const asyncHandler_1 = __importDefault(require("./utils/asyncHandler"));
const ApiResponse_1 = require("./utils/ApiResponse");
const index_2 = __importDefault(require("./db/seed/index"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
dotenv_1.default.config({
    path: "./.env",
});
// Health check route
app_1.app.use("/api/v1/health-check", (0, asyncHandler_1.default)(async (req, res) => {
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, "API Server is running", "Health check Passed"));
}));
// Fallback for 404
app_1.app.use((req, res) => {
    res
        .status(404)
        .json({ message: "Requested resource could not be found. 😐" });
});
const PORT = process.env.PORT || 5000;
(0, index_1.default)()
    .then(async () => {
    // sowing all seeds
    await (0, index_2.default)();
    const server = http_1.default.createServer(app_1.app);
    (0, socket_1.initSocket)(server);
    // Start the server
    server.listen(PORT, () => {
        console.log(`\n  Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
});
// Handle uncaught exceptions and unhandled rejections
// This is important for production to avoid silent failures
// and to log errors properly.
process.on("uncaughtException", (error) => {
    logger_1.default.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    logger_1.default.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});
