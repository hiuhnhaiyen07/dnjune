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

const Service=require("../models/Service")
const {getServices}=require("../utils/smmApi")

/* SYNC SERVICES */

router.post("/sync-services",auth,admin,async(req,res)=>{

const services=await getServices()

for(const s of services){

let exist=await Service.findOne({serviceId:s.service})

if(!exist){

await Service.create({

serviceId:s.service,
name:s.name,
category:s.category,
rate:s.rate,
min:s.min,
max:s.max,
price:s.rate*1.5

})

}

}

res.json({message:"Sync completed"})

})

/* UPDATE SERVICE PRICE */

router.post("/service-price/:id",auth,admin,async(req,res)=>{

await Service.findByIdAndUpdate(req.params.id,{
price:req.body.price
})

res.json({message:"Price updated"})

})
