const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  billImage: String,
  status: {
    type: String,
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Payment", PaymentSchema)
