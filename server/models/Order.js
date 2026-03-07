const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({
  userId: String,
  service: String,
  link: String,
  quantity: Number,
  price: Number,
  status: String,
  apiOrderId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Order", OrderSchema)
