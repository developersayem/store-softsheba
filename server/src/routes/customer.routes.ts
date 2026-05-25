import { Router } from "express";
import * as customerController from "../controllers/customer.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", customerController.createCustomer);
router.get("/", verifyJWT, customerController.listCustomers);
router.get("/:id", verifyJWT, customerController.getCustomer);
router.put("/:id", verifyJWT, customerController.updateCustomer);
router.delete("/:id", verifyJWT, customerController.deleteCustomer);
router.post("/:id/block", verifyJWT, customerController.blockCustomer);
router.post("/:id/unblock", verifyJWT, customerController.unblockCustomer);
router.post("/block-many", verifyJWT, customerController.blockMany);
router.patch("/create-group", verifyJWT, customerController.createGroup);
router.patch("/update-group", verifyJWT, customerController.updateGroup);
router.post("/delete-group", verifyJWT, customerController.deleteGroup);
router.get("/groups/list", verifyJWT, customerController.listGroups);
router.get("/suggestions/search", verifyJWT, customerController.getSearchSuggestions);
router.get("/filter-by-purchase/filter", verifyJWT, customerController.getCustomersByPurchase);

export default router;
