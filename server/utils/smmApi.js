const axios = require("axios");

const API_URL = process.env.SMM_API_URL;
const API_KEY = process.env.SMM_API_KEY;

// Kiểm tra biến môi trường ngay đầu file
if (!API_URL || !API_KEY) {
  console.error("[SMM API] Thiếu biến môi trường: SMM_API_URL hoặc SMM_API_KEY");
}

async function getServices() {
  try {
    console.log("[SMM API] Gọi getServices - URL:", API_URL);
    const res = await axios.post(API_URL, {
      key: API_KEY,
      action: "services"
    }, {
      timeout: 15000 // timeout 15s để tránh treo
    });

    console.log("[SMM API] getServices response:", res.data);
    return res.data;
  } catch (err) {
    console.error("[SMM API] Lỗi getServices:", err.message);
    if (err.response) {
      console.error("[SMM API] Response từ provider:", err.response.data);
      console.error("[SMM API] Status:", err.response.status);
    }
    throw err;
  }
}

async function createOrder(service, link, quantity) {
  try {
    console.log("[SMM API] Gọi createOrder - params:", { service, link, quantity });
    const payload = {
      key: API_KEY,
      action: "add",
      service: Number(service), // đảm bảo là số
      link,
      quantity: Number(quantity)
    };

    console.log("[SMM API] Payload gửi:", payload);

    const res = await axios.post(API_URL, payload, {
      timeout: 30000 // timeout dài hơn cho action add
    });

    console.log("[SMM API] createOrder response:", res.data);
    return res.data;
  } catch (err) {
    console.error("[SMM API] Lỗi createOrder:", err.message);
    if (err.response) {
      console.error("[SMM API] Response từ provider:", err.response.data);
      console.error("[SMM API] Status:", err.response.status);
      console.error("[SMM API] Headers:", err.response.headers);
    } else if (err.request) {
      console.error("[SMM API] Không nhận được response từ provider:", err.request);
    }
    throw err;
  }
}

async function checkStatus(order) {
  try {
    console.log("[SMM API] Gọi checkStatus - order ID:", order);
    const res = await axios.post(API_URL, {
      key: API_KEY,
      action: "status",
      order: Number(order) // đảm bảo là số
    }, {
      timeout: 15000
    });

    console.log("[SMM API] checkStatus response:", res.data);
    return res.data;
  } catch (err) {
    console.error("[SMM API] Lỗi checkStatus:", err.message);
    if (err.response) {
      console.error("[SMM API] Response từ provider:", err.response.data);
    }
    throw err;
  }
}

module.exports = {
  getServices,
  createOrder,
  checkStatus
};
