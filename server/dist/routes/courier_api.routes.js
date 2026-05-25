"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const courier_api_controller_1 = require("../controllers/courier_api.controller");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.verifyJWT, courier_api_controller_1.getCouirerApi);
router.patch('/', auth_middleware_1.verifyJWT, courier_api_controller_1.updateCourierApi);
// Carrybee specific
router.get('/carrybee/cities', auth_middleware_1.verifyJWT, courier_api_controller_1.getCarrybeeCities);
router.get('/carrybee/zones/:cityId', auth_middleware_1.verifyJWT, courier_api_controller_1.getCarrybeeZones);
router.get('/carrybee/areas/:cityId/:zoneId', auth_middleware_1.verifyJWT, courier_api_controller_1.getCarrybeeAreas);
router.get('/carrybee/stores', auth_middleware_1.verifyJWT, courier_api_controller_1.getCarrybeeStores);
router.get('/carrybee/area-suggestion', auth_middleware_1.verifyJWT, courier_api_controller_1.getCarrybeeAreaSuggestion);
router.post('/carrybee/address-details', auth_middleware_1.verifyJWT, courier_api_controller_1.getCarrybeeAddressDetails);
router.post('/carrybee/stores', auth_middleware_1.verifyJWT, courier_api_controller_1.createCarrybeeStore);
exports.default = router;
