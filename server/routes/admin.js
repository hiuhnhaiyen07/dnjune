const express = require("express")

const auth = require("../middleware/auth")
const admin = require("../middleware/admin")

const User = require("../models/User")
const Payment = require("../models/Payment")
const Order = require("../models/Order")

const router = express.Router()

/* DASHBOARD */

router.get("/stats", auth, admin, async (req, res) => {

  const users = await User.countDocuments()

  const orders = await Order.countDocuments()

  const payments = await Payment.find({ status: "approved" })

  let revenue = 0

  payments.forEach(p => revenue += p.amount)

  res.json({
    users,
    orders,
    revenue
  })

})

/* APPROVE PAYMENT */

router.post("/approve/:id", auth, admin, async (req, res) => {

  const payment = await Payment.findById(req.params.id)

  payment.status = "approved"

  await payment.save()

  const user = await User.findById(payment.userId)

  user.balance += payment.amount

  await user.save()

  res.json({ message: "Đã cộng tiền" })

})

module.exports = router
