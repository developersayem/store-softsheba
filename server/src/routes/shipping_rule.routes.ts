import { Router } from "express";
import {
  getAllShippingRules,
  getShippingRuleById,
  createShippingRule,
  updateShippingRule,
  deleteShippingRule,
  toggleShippingRuleStatus,
} from "../controllers/shipping_rule.controller";

const router = Router();

router.get("/", getAllShippingRules);
router.get("/:id", getShippingRuleById);
router.post("/", createShippingRule);
router.patch("/:id/toggle-active", toggleShippingRuleStatus);
router.put("/:id", updateShippingRule);
router.delete("/:id", deleteShippingRule);

export default router;
