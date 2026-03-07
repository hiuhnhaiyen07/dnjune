const axios = require("axios")

const API_URL = process.env.SMM_API_URL
const API_KEY = process.env.SMM_API_KEY

async function getServices() {
  const res = await axios.post(API_URL, {
    key: API_KEY,
    action: "services"
  })

  return res.data
}

async function createOrder(service, link, quantity) {
  const res = await axios.post(API_URL, {
    key: API_KEY,
    action: "add",
    service,
    link,
    quantity
  })

  return res.data
}

async function checkStatus(order) {
  const res = await axios.post(API_URL, {
    key: API_KEY,
    action: "status",
    order
  })

  return res.data
}

module.exports = {
  getServices,
  createOrder,
  checkStatus
}
