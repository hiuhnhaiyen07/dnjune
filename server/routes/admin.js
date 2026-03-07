const express = require("express")

const auth = require("../middleware/auth")
const admin = require("../middleware/admin")

const User = require("../models/User")
const Payment = require("../models/Payment")
const Order = require("../models/Order")
const Transaction = require("../models/Transaction")

const router = express.Router()

/* =========================
   DASHBOARD STATS
========================= */

router.get("/stats", auth, admin, async (req,res)=>{

try{

const users = await User.countDocuments()
const orders = await Order.countDocuments()

const payments = await Payment.find({status:"approved"})

let revenue = 0

payments.forEach(p=>{
revenue += Number(p.amount)
})

res.json({
users,
orders,
revenue
})

}catch(err){

console.log(err)

res.status(500).json({error:"Server error"})

}

})

/* =========================
   LIST USERS
========================= */

router.get("/users", auth, admin, async (req,res)=>{

try{

const users = await User
.find()
.sort({createdAt:-1})

res.json(users)

}catch(err){

res.status(500).json({error:"Server error"})

}

})

/* =========================
   LIST PAYMENTS
========================= */

router.get("/payments", auth, admin, async (req,res)=>{

try{

const payments = await Payment
.find()
.sort({createdAt:-1})

res.json(payments)

}catch(err){

res.status(500).json({error:"Server error"})

}

})

/* =========================
   APPROVE PAYMENT
========================= */

router.post("/approve/:id", auth, admin, async (req,res)=>{

try{

const payment = await Payment.findById(req.params.id)

if(!payment){
return res.json({error:"Payment không tồn tại"})
}

if(payment.status === "approved"){
return res.json({error:"Bill đã duyệt"})
}

payment.status = "approved"

await payment.save()

const user = await User.findById(payment.userId)

if(!user){
return res.json({error:"User không tồn tại"})
}

user.balance += Number(payment.amount)

await user.save()

await Transaction.create({

userId:user._id,
type:"deposit",
amount:Number(payment.amount),
note:"Nạp tiền"

})

res.json({
message:"Đã cộng tiền"
})

}catch(err){

console.log(err)

res.status(500).json({error:"Server error"})

}

})

/* =========================
   REJECT PAYMENT
========================= */

router.post("/reject/:id", auth, admin, async (req,res)=>{

try{

const payment = await Payment.findById(req.params.id)

if(!payment){
return res.json({error:"Payment không tồn tại"})
}

payment.status = "rejected"

await payment.save()

res.json({
message:"Đã từ chối bill"
})

}catch(err){

res.status(500).json({error:"Server error"})

}

})

/* =========================
   MANUAL BALANCE
========================= */

router.post("/manual-balance", auth, admin, async (req,res)=>{

try{

const { username, amount, type, reason } = req.body

if(!username || !amount){
return res.json({error:"Thiếu dữ liệu"})
}

const user = await User.findOne({username})

if(!user){
return res.json({error:"User không tồn tại"})
}

const money = Number(amount)

if(isNaN(money)){
return res.json({error:"Số tiền không hợp lệ"})
}

if(type === "add"){

user.balance += money

}else if(type === "sub"){

if(user.balance < money){
return res.json({error:"Số dư user không đủ"})
}

user.balance -= money

}else{

return res.json({error:"Type không hợp lệ"})

}

await user.save()

await Transaction.create({

userId:user._id,
type:type === "add" ? "admin_add" : "admin_sub",
amount:money,
note:reason || "Admin chỉnh số dư"

})

res.json({
message:"Đã cập nhật số dư"
})

}catch(err){

console.log(err)

res.status(500).json({error:"Server error"})

}

})

/* =========================
   TRANSACTION LOG
========================= */

router.get("/transactions", auth, admin, async (req,res)=>{

try{

const logs = await Transaction
.find()
.sort({createdAt:-1})
.limit(100)

res.json(logs)

}catch(err){

res.status(500).json({error:"Server error"})

}

})

module.exports = router
