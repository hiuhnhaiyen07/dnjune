const express = require("express")

const auth = require("../middleware/auth")
const admin = require("../middleware/admin")

const User = require("../models/User")
const Payment = require("../models/Payment")
const Order = require("../models/Order")
const Service = require("../models/Service")

const { getServices } = require("../utils/smmApi")

const router = express.Router()

/* =========================
   DASHBOARD STATS
========================= */

router.get("/stats", auth, admin, async (req,res)=>{

const users = await User.countDocuments()
const orders = await Order.countDocuments()

const payments = await Payment.find({status:"approved"})

let revenue = 0

payments.forEach(p=>{
revenue += p.amount
})

res.json({
users,
orders,
revenue
})

})

/* =========================
   LIST PAYMENTS (ADMIN)
========================= */

router.get("/payments", auth, admin, async (req,res)=>{

const payments = await Payment
.find()
.sort({createdAt:-1})

res.json(payments)

})

/* =========================
   APPROVE PAYMENT
========================= */

router.post("/approve/:id", auth, admin, async (req,res)=>{

const payment = await Payment.findById(req.params.id)

if(!payment){
return res.json({error:"Payment không tồn tại"})
}

if(payment.status==="approved"){
return res.json({error:"Bill đã duyệt"})
}

payment.status="approved"

await payment.save()

const user = await User.findById(payment.userId)

user.balance += payment.amount

await user.save()

res.json({
message:"Đã cộng tiền"
})

})

/* =========================
   REJECT PAYMENT
========================= */

router.post("/reject/:id", auth, admin, async (req,res)=>{

const payment = await Payment.findById(req.params.id)

if(!payment){
return res.json({error:"Payment không tồn tại"})
}

payment.status="rejected"

await payment.save()

res.json({
message:"Đã từ chối bill"
})

})

/* =========================
   MANUAL BALANCE
========================= */

router.post("/balance/:id", auth, admin, async (req,res)=>{

try{

const { amount, type } = req.body

const user = await User.findById(req.params.id)

if(!user){
return res.json({error:"User không tồn tại"})
}

if(type==="add"){
user.balance += Number(amount)
}

if(type==="sub"){
user.balance -= Number(amount)
}

await user.save()

res.json({
message:"Đã cập nhật số dư"
})

}catch(err){

res.status(500).json({error:"Server error"})

}

})

/* =========================
   LIST SERVICES
========================= */

router.get("/services", auth, admin, async (req,res)=>{

const services = await Service.find()

res.json(services)

})

/* =========================
   ADD SERVICE
========================= */

router.post("/service-add", auth, admin, async (req,res)=>{

const { service, name, rate, min, max } = req.body

await Service.create({
service,
name,
rate,
min,
max,
enabled:true
})

res.json({
message:"Service added"
})

})

/* =========================
   UPDATE SERVICE RATE
========================= */

router.post("/service-rate/:id", auth, admin, async (req,res)=>{

const { rate } = req.body

await Service.findByIdAndUpdate(
req.params.id,
{ rate }
)

res.json({
message:"Rate updated"
})

})

/* =========================
   TOGGLE SERVICE
========================= */

router.post("/service-toggle/:id", auth, admin, async (req,res)=>{

const service = await Service.findById(req.params.id)

service.enabled = !service.enabled

await service.save()

res.json({
message:"Status updated"
})

})

/* =========================
   DELETE SERVICE
========================= */

router.delete("/service-delete/:id", auth, admin, async (req,res)=>{

await Service.findByIdAndDelete(req.params.id)

res.json({
message:"Service deleted"
})

})

/* =========================
   SYNC SERVICES FROM API
========================= */

router.post("/services/sync", auth, admin, async (req,res)=>{

const services = await getServices()

for(const s of services){

const exist = await Service.findOne({service:s.service})

if(!exist){

await Service.create({
service:s.service,
name:s.name,
rate:s.rate,
min:s.min,
max:s.max,
enabled:true
})

}

}

res.json({
message:"Sync completed"
})

})

module.exports = router
