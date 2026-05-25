import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { 
    createCarrybeeStore,
    getCarrybeeAddressDetails,
    getCarrybeeAreaSuggestion,
    getCarrybeeAreas, 
    getCarrybeeCities, 
    getCarrybeeStores, 
    getCarrybeeZones, 
    getCouirerApi, 
    updateCourierApi 
} from "../controllers/courier_api.controller";
const router = Router();

router.get('/',verifyJWT,getCouirerApi)
router.patch('/',verifyJWT,updateCourierApi)

// Carrybee specific
router.get('/carrybee/cities', verifyJWT, getCarrybeeCities)
router.get('/carrybee/zones/:cityId', verifyJWT, getCarrybeeZones)
router.get('/carrybee/areas/:cityId/:zoneId', verifyJWT, getCarrybeeAreas)
router.get('/carrybee/stores', verifyJWT, getCarrybeeStores)
router.get('/carrybee/area-suggestion', verifyJWT, getCarrybeeAreaSuggestion)
router.post('/carrybee/address-details', verifyJWT, getCarrybeeAddressDetails)
router.post('/carrybee/stores', verifyJWT, createCarrybeeStore)

export default router;
