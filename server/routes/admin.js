const express = require("express")

const auth = require("../middleware/auth")
const admin = require("../middleware/admin")

const User = require("../models/User")
const Payment = require("../models/Payment")
const Order = require("../models/Order")
const Transaction = require("../models/Transaction")
const Ticket = require("../models/Ticket")

const router = express.Router()
const path = require('path');  // Thêm dòng này ở đầu file nếu chưa có

// Route chính cho trang admin dashboard
router.get('/', auth, admin, (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/dashboard.html'));
  // Hoặc nếu path không khớp, thử: path.join(__dirname, '../../../views/dashboard.html')
});
/* =========================
   DASHBOARD STATS
========================= */

router.get("/stats", auth, admin, async (req,res)=>{

try{

const users = await User.countDocuments()

const orders = await Order.countDocuments()

const runningOrders = await Order.countDocuments({
status:"processing"
})

const completedOrders = await Order.countDocuments({
status:"completed"
})

const pendingPayments = await Payment.countDocuments({
status:"pending"
})

const tickets = await Ticket.countDocuments({
status:"open"
})

const payments = await Payment.find({
status:"approved"
})

let revenue = 0

payments.forEach(p=>{
revenue += Number(p.amount)
})

res.json({

users,
orders,
runningOrders,
completedOrders,
pendingPayments,
tickets,
revenue

})

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

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

console.log(err)

res.status(500).json({
error:"Server error"
})

}

})

/* =========================
   LIST PAYMENTS
========================= */

router.get("/payments", auth, admin, async (req,res)=>{

try{

const payments = await Payment
.find()
.populate("userId","username email")
.sort({createdAt:-1})

res.json(payments)

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

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
note:"Nạp tiền qua admin"

})

res.json({
message:"Đã cộng tiền",
balance:user.balance
})

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

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

console.log(err)

res.status(500).json({
error:"Server error"
})

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

const user = await User.findOne({
$or:[
{username:username},
{email:username}
]
})

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
message:"Đã cập nhật số dư",
balance:user.balance
})

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

}

})

/* =========================
   TRANSACTION LOG
========================= */

router.get("/transactions", auth, admin, async (req,res)=>{

try{

const logs = await Transaction
.find()
.populate("userId","username")
.sort({createdAt:-1})
.limit(100)

res.json(logs)

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

}

})

/* =========================
   LIST TICKETS
========================= */

router.get("/tickets", auth, admin, async (req,res)=>{

try{

const tickets = await Ticket
.find()
.populate("userId","username")
.sort({createdAt:-1})

res.json(tickets)

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

}

})

/* =========================
   VIEW TICKET
========================= */

router.get("/ticket/:id", auth, admin, async (req,res)=>{

try{

const ticket = await Ticket
.findById(req.params.id)
.populate("userId","username")

if(!ticket){
return res.json({error:"Ticket không tồn tại"})
}

res.json(ticket)

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

}

})

/* =========================
   REPLY TICKET
========================= */

router.post("/ticket-reply/:id", auth, admin, async (req,res)=>{

try{

const ticket = await Ticket.findById(req.params.id)

if(!ticket){
return res.json({error:"Ticket không tồn tại"})
}

ticket.reply = req.body.reply
ticket.status = "answered"

await ticket.save()

res.json({
message:"Đã trả lời ticket"
})

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

}

})

module.exports = router
