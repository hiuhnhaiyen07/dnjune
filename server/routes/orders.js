const express = require("express")

const auth = require("../middleware/auth")

const { createOrder, checkStatus } = require("../utils/smmApi")

const Order = require("../models/Order")
const User = require("../models/User")

const router = express.Router()

/* CREATE ORDER */

router.post("/create", auth, async (req, res) => {

  const { service, link, quantity, price } = req.body

  const user = await User.findById(req.user.id)

  if (user.balance < price) {
    return res.json({ error: "Không đủ số dư" })
  }

  const api = await createOrder(service, link, quantity)

  const order = new Order({

    userId: user._id,
    service,
    link,
    quantity,
    price,
    status: "processing",
    apiOrderId: api.order

  })

  await order.save()

  user.balance -= price
  await user.save()

  res.json({ message: "Đặt đơn thành công" })

})

/* CHECK STATUS */

router.get("/status/:id", auth, async (req, res) => {

  const order = await Order.findById(req.params.id)

  const status = await checkStatus(order.apiOrderId)

  order.status = status.status

  await order.save()

  res.json(status)

})

/* USER ORDERS */

router.get("/my", auth, async (req, res) => {

  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })

  res.json(orders)

})

module.exports = router

const Transaction=require("../models/Transaction")

await Transaction.create({

userId:user._id,
type:"order",
amount:-price,
note:"Order "+order._id

})

const antiSpam = require("../middleware/antiSpam")

router.post("/create",auth,antiSpam,async(req,res)=>{
