const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);

router.get("/", protect, adminOnly, getAllOrders);

router.get("/:id", protect, getOrder);

router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;