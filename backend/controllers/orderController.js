const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const DELIVERY_FEE = 150;

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { items, customerName, phone, address } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50 ||
      typeof customerName !== "string" ||
      !customerName.trim() ||
      customerName.trim().length > 100 ||
      typeof phone !== "string" ||
      !/^[+\d][\d\s().-]{6,19}$/.test(phone.trim()) ||
      typeof address !== "string" ||
      !address.trim() ||
      address.trim().length > 500
    ) {
      return res.status(400).json({
        message: "Order items and customer information are required",
      });
    }

    const hasInvalidItem = items.some(
      (item) =>
        !item ||
        typeof item.product !== "string" ||
        !mongoose.isObjectIdOrHexString(item.product) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
    );

    if (hasInvalidItem) {
      return res.status(400).json({ message: "One or more order items are invalid" });
    }

    const products = await Product.find({
      _id: { $in: items.map((item) => item.product) },
      isAvailable: true,
    });
    const productsById = new Map(products.map((product) => [product._id.toString(), product]));
    const normalizedItems = items.map((item) => {
      const product = productsById.get(item.product);
      return product && {
        product: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || "",
      };
    });

    if (normalizedItems.some((item) => !item)) {
      return res.status(400).json({ message: "One or more items are unavailable. Refresh your cart and try again." });
    }

    const hasChangedPrice = items.some((item) => {
      const product = productsById.get(item.product);
      return Number(item.price) !== product.price;
    });
    if (hasChangedPrice) {
      return res.status(409).json({ message: "A menu price has changed. Refresh your cart before placing the order." });
    }

    const calculatedSubtotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const calculatedDeliveryFee = DELIVERY_FEE;

    const order = await Order.create({
      user: req.user.id,
      items: normalizedItems,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod: "Cash on Delivery",
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      total: calculatedSubtotal + calculatedDeliveryFee,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

// GET SINGLE ORDER
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.user?._id?.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this order",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get order",
      error: error.message,
    });
  }
};

// GET ALL ORDERS - ADMIN
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get all orders",
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS - ADMIN
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(error.name === "ValidationError" ? 400 : 500).json({
      message: error.name === "ValidationError" ? "Invalid order status" : "Failed to update order status",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
};
