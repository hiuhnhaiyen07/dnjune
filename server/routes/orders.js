/* CREATE ORDER - ĐÃ THÊM DEBUG & XỬ LÝ LỖI CHI TIẾT */
router.post("/create", auth, antiSpam, async (req, res) => {
  try {
    let { service, link, quantity } = req.body;
    quantity = Number(quantity);

    // Debug input từ frontend
    console.log("[ORDER CREATE] Input:", { service, link, quantity, userId: req.user?.id });

    /* VALIDATE */
    if (!service || !link || !quantity) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    if (quantity <= 0 || isNaN(quantity)) {
      return res.status(400).json({ error: "Số lượng không hợp lệ" });
    }

    if (!link.startsWith("http")) {
      return res.status(400).json({ error: "Link không hợp lệ" });
    }

    /* FIND SERVICE */
    console.log("[ORDER CREATE] Tìm service với ID:", service);
    const s = await Service.findById(service);

    if (!s || !s.enabled) {
      console.log("[ORDER CREATE] Không tìm thấy service hoặc bị tắt:", service);
      return res.status(400).json({ error: "Dịch vụ không tồn tại hoặc bị tắt" });
    }

    console.log("[ORDER CREATE] Tìm thấy service:", s.name, "rate:", s.rate);

    /* CHECK LIMIT */
    if (quantity < s.min || quantity > s.max) {
      return res.status(400).json({
        error: `Số lượng phải từ ${s.min} - ${s.max}`
      });
    }

    /* CALCULATE PRICE */
    const price = Math.ceil((quantity / 1000) * s.rate);
    console.log("[ORDER CREATE] Giá tính được:", price);

    /* FIND USER */
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("[ORDER CREATE] Không tìm thấy user:", req.user.id);
      return res.status(404).json({ error: "User không tồn tại" });
    }

    console.log("[ORDER CREATE] User:", user.username, "balance hiện tại:", user.balance);

    /* CHECK BALANCE */
    if (user.balance < price) {
      return res.status(400).json({ error: "Không đủ số dư" });
    }

    /* SEND ORDER TO PROVIDER */
    let api;
    try {
      console.log("[ORDER CREATE] Gọi provider với:", { provider: s.provider || s.service, link, quantity });
      api = await createOrder(s.provider || s.service, link, quantity);
      console.log("[ORDER CREATE] Provider trả về:", api);
    } catch (e) {
      console.error("[ORDER CREATE] Lỗi gọi provider:", e.message, e.stack);
      return res.status(500).json({ error: "Lỗi từ nhà cung cấp: " + e.message });
    }

    if (!api || !api.order) {
      console.log("[ORDER CREATE] Provider trả lỗi không có orderId:", api);
      return res.status(500).json({ error: "Provider trả lỗi (không có order ID)" });
    }

    /* CREATE ORDER */
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

    /* UPDATE BALANCE */
    user.balance -= price;
    await user.save();
    console.log("[ORDER CREATE] Cập nhật balance user:", user.balance);

    /* CREATE TRANSACTION */
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
