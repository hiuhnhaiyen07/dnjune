// server/routes/services.js
const express = require("express");
const auth = require("../middleware/auth");

const servicesConfig = require("../config/services");

const router = express.Router();

/* =========================
   GET ALL SERVICES
========================= */
router.get("/", auth, async (req, res) => {
  try {
    const services = [];

    // Flatten danh sách từ config
    servicesConfig.forEach((category) => {
      category.services.forEach((s) => {
        services.push({
          service: s.id,              // ID service (dùng cho value select và gửi order)
          name: s.name,               // Tên hiển thị
          rate: Number(s.rate) || 0,  // Đảm bảo là số
          min: Number(s.min) || 1,    // Default nếu thiếu
          max: Number(s.max) || 10000,
          provider: s.provider || null,
          category: category.category || "Khác"
        });
      });
    });

    // Sắp xếp theo tên hoặc category nếu muốn (optional)
    // services.sort((a, b) => a.name.localeCompare(b.name));

    if (services.length === 0) {
      return res.json([]); // Trả mảng rỗng nếu config không có dịch vụ
    }

    res.json(services);
  } catch (err) {
    console.error("Lỗi get services:", err);
    res.status(500).json({ error: "Server error khi tải dịch vụ" });
  }
});

module.exports = router;
