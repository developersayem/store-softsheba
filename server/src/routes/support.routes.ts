import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getSupportMailById,
  getSupportMails,
  takeSupportMails,
} from "../controllers/support.controller";
const router = Router();

router.get("/", verifyJWT, getSupportMails);
router.get("/:id", verifyJWT, getSupportMailById);
router.post("/", verifyJWT, takeSupportMails);
export default router;
