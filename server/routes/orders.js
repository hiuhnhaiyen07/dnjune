const express = require("express");

const auth = require("../middleware/auth");
const antiSpam = require("../middleware/antiSpam");

const { createOrder, checkStatus } = require("../utils/smmApi");

const Order = require("../models/Order");
const User = require("../models/User");
const Service = require("../models/Service");
const Transaction = require("../models/Transaction");

const router = express.Router();  // ← DÒNG NÀY BẮT BUỘC PHẢI CÓ!

/* =========================
   CREATE ORDER
========================= */
router.post("/create", auth, antiSpam, async (req, res) => {
  try {
    let { service, link, quantity } = req.body;
    quantity = Number(quantity);

    console.log("[ORDER CREATE] Input:", { service, link, quantity, userId: req.user?.id });

    if (!service || !link || !quantity) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    if (quantity <= 0 || isNaN(quantity)) {
      return res.status(400).json({ error: "Số lượng không hợp lệ" });
    }

    if (!link.startsWith("http")) {
      return res.status(400).json({ error: "Link không hợp lệ" });
    }

    console.log("[ORDER CREATE] Tìm service với ID:", service);
    const s = await Service.findById(service);

    if (!s || !s.enabled) {
      console.log("[ORDER CREATE] Không tìm thấy service hoặc bị tắt:", service);
      return res.status(400).json({ error: "Dịch vụ không tồn tại hoặc bị tắt" });
    }

    console.log("[ORDER CREATE] Tìm thấy service:", s.name, "rate:", s.rate);

    if (quantity < s.min || quantity > s.max) {
      return res.status(400).json({
        error: `Số lượng phải từ ${s.min} - ${s.max}`
      });
    }

    const price = Math.ceil((quantity / 1000) * s.rate);
    console.log("[ORDER CREATE] Giá tính được:", price);

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("[ORDER CREATE] Không tìm thấy user:", req.user.id);
      return res.status(404).json({ error: "User không tồn tại" });
    }

    console.log("[ORDER CREATE] User:", user.username, "balance:", user.balance);

    if (user.balance < price) {
      return res.status(400).json({ error: "Không đủ số dư" });
    }

    let api;
    try {
      console.log("[ORDER CREATE] Gọi provider:", { provider: s.provider || s.service, link, quantity });
      api = await createOrder(s.provider || s.service, link, quantity);
      console.log("[ORDER CREATE] Provider response:", api);
    } catch (e) {
      console.error("[ORDER CREATE] Lỗi gọi provider:", e.message, e.stack);
      return res.status(500).json({ error: "Lỗi từ nhà cung cấp: " + e.message });
    }

    if (!api || !api.order) {
      console.log("[ORDER CREATE] Provider trả lỗi không có orderId:", api);
      return res.status(500).json({ error: "Provider trả lỗi (không có order ID)" });
    }

    const order = new Order({
      userId: user._id,
      service: s._id,
      link,
      quantity,
      price,
      status: "processing",
      apiOrderId: api.order
    });

    await order.save();
    console.log("[ORDER CREATE] Đã lưu order:", order._id);

    user.balance -= price;
    await user.save();
    console.log("[ORDER CREATE] Cập nhật balance:", user.balance);

    await Transaction.create({
      userId: user._id,
      type: "order",
      amount: -price,
      note: "Order " + order._id
    });
    console.log("[ORDER CREATE] Đã tạo transaction");

    res.json({
      message: "Đặt đơn thành công",
      orderId: order._id
    });
  } catch (err) {
    console.error("[ORDER CREATE] Lỗi server chi tiết:", err.message, err.stack);
    res.status(500).json({
      error: "Server error: " + err.message
    });
  }
});

/* CHECK STATUS */
router.get("/status/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.json({ error: "Order không tồn tại" });
    }

    if (String(order.userId) !== req.user.id) {
      return res.json({ error: "Không có quyền" });
    }

    let status;
    try {
      status = await checkStatus(order.apiOrderId);
    } catch (e) {
      return res.json({ error: "Provider lỗi" });
    }

    if (!status) {
      return res.json({ error: "Không lấy được status" });
    }

    order.status = status.status || order.status;
    await order.save();

    res.json(status);
  } catch (err) {
    console.error("Lỗi check status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* USER ORDERS */
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Lỗi get my orders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
