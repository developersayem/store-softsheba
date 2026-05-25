import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getFacebookPixel, getGoogleConfig, getMarketing, getSeoConfig, updateMarketing } from "../controllers/marketing.controller";
import { checkPermission } from "../middlewares/role.middleware";

const router = Router();
//public routes
router.get('/get-facebook',getFacebookPixel)
router.get('/get-google',getGoogleConfig)
router.get('/get-seo',getSeoConfig)


//private routes
router.get('/', verifyJWT, checkPermission("marketing:view"), getMarketing)
router.patch('/', verifyJWT, checkPermission("marketing:manage"), updateMarketing)

export default router;