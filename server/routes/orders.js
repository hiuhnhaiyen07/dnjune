const express = require("express")

const auth = require("../middleware/auth")
const antiSpam = require("../middleware/antiSpam")

const { createOrder, checkStatus } = require("../utils/smmApi")

const Order = require("../models/Order")
const User = require("../models/User")
const Service = require("../models/Service")
const Transaction = require("../models/Transaction")

const router = express.Router()

/* =========================
   CREATE ORDER
========================= */

router.post("/create", auth, antiSpam, async (req, res) => {

try{

let { service, link, quantity } = req.body

quantity = Number(quantity)

/* VALIDATE */

if(!service || !link || !quantity){
return res.json({ error:"Thiếu dữ liệu" })
}

if(quantity <= 0 || isNaN(quantity)){
return res.json({ error:"Số lượng không hợp lệ" })
}

if(!link.startsWith("http")){
return res.json({ error:"Link không hợp lệ" })
}

/* FIND SERVICE */

const s = await Service.findOne({ service, enabled:true })

if(!s){
return res.json({ error:"Service không tồn tại" })
}

/* CHECK LIMIT */

if(quantity < s.min || quantity > s.max){
return res.json({
error:`Số lượng phải từ ${s.min} - ${s.max}`
})
}

/* CALCULATE PRICE */

const price = Math.ceil((quantity / 1000) * s.rate)

/* FIND USER */

const user = await User.findById(req.user.id)

if(!user){
return res.json({ error:"User không tồn tại" })
}

/* CHECK BALANCE */

if(user.balance < price){
return res.json({ error:"Không đủ số dư" })
}

/* SEND ORDER TO PROVIDER */

let api

try{

api = await createOrder(s.provider, link, quantity)

}catch(e){

return res.json({ error:"Provider lỗi" })

}

if(!api || !api.order){
return res.json({ error:"Provider trả lỗi" })
}

/* CREATE ORDER */

const order = new Order({

userId: user._id,

service: s.service,
link,
quantity,

price,

status:"processing",

apiOrderId: api.order

})

await order.save()

/* UPDATE BALANCE */

user.balance -= price
await user.save()

/* CREATE TRANSACTION */

await Transaction.create({

userId:user._id,

type:"order",

amount:-price,

note:"Order "+order._id

})

res.json({

message:"Đặt đơn thành công",

orderId:order._id

})

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

}

})

/* =========================
   CHECK STATUS
========================= */

router.get("/status/:id", auth, async (req,res)=>{

try{

const order = await Order.findById(req.params.id)

if(!order){
return res.json({error:"Order không tồn tại"})
}

/* CHECK OWNER */

if(String(order.userId) !== req.user.id){
return res.json({error:"Không có quyền"})
}

/* CALL PROVIDER */

let status

try{

status = await checkStatus(order.apiOrderId)

}catch(e){

return res.json({error:"Provider lỗi"})
}

if(!status){
return res.json({error:"Không lấy được status"})
}

/* UPDATE ORDER */

order.status = status.status || order.status

await order.save()

res.json(status)

}catch(err){

res.status(500).json({error:"Server error"})

}

})

/* =========================
   USER ORDERS
========================= */

router.get("/my", auth, async (req,res)=>{

try{

const orders = await Order
.find({userId:req.user.id})
.sort({createdAt:-1})

res.json(orders)

}catch(err){

res.status(500).json({error:"Server error"})

}

})

module.exports = router
