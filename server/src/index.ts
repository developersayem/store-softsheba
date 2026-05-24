import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { ENV } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // Ensure helmet allows static images across origins
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Allow frontend
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Softsheba API is running...");
});

// Error Handling
app.use(errorHandler);

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
