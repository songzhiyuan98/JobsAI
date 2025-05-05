const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const authMiddleware = require("../middleware/auth");
const {
  cancelStripeSubscription,
} = require("../controllers/paymentController");

// 只对 webhook 路由用 express.raw
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

router.post(
  "/create-checkout-session",
  protect,
  paymentController.createCheckoutSession
);

router.get(
  "/get-subscription-status",
  protect,
  paymentController.getSubscriptionStatus
);

router.post("/cancel-subscription", protect, cancelStripeSubscription);

module.exports = {
  router,
  handleWebhook: paymentController.handleWebhook,
};
