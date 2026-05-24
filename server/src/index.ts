import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { ENV } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // Ensure helmet allows static images across origins
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Softsheba API is running...");
});

// Error Handling
app.use(errorHandler);

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
