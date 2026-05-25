import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getMyStore, updateCustomDomain } from "../controllers/store.controller";

const router = Router();

// All store routes require authentication
router.use(verifyJWT);

router.route("/me").get(getMyStore);
router.route("/custom-domain").patch(updateCustomDomain);

export default router;
