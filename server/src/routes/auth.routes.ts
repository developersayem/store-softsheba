import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

// Example of a protected route
router.get("/me", authenticateJWT, (req: any, res) => {
  res.json({ message: "Protected data", user: req.user });
});

export default router;
