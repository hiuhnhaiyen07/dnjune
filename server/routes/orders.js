const express = require("express")

const auth = require("../middleware/auth")
const antiSpam = require("../middleware/antiSpam")

const { createOrder, checkStatus } = require("../utils/smmApi")

const Order = require("../models/Order")
const User = require("../models/User")
const Service = require("../models/Service")
const Transaction = require("../models/Transaction")

const router = express.Router()

/* CREATE ORDER */

router.post("/create", auth, antiSpam, async (req, res) => {

try{

const { service, link, quantity } = req.body

/* FIND SERVICE */

const s = await Service.findOne({ service })

if(!s){
return res.json({ error:"Service không tồn tại" })
}

/* CHECK MIN MAX */

if(quantity < s.min || quantity > s.max){
return res.json({ error:"Số lượng không hợp lệ" })
}

/* CALCULATE PRICE */

const price = (quantity / 1000) * s.rate

/* FIND USER */

const user = await User.findById(req.user.id)

if(user.balance < price){
return res.json({ error:"Không đủ số dư" })
}

/* SEND ORDER TO PROVIDER */

const api = await createOrder(service, link, quantity)

if(!api || !api.order){
return res.json({ error:"Provider lỗi" })
}

/* CREATE ORDER */

const order = new Order({
userId: user._id,
service,
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

/* TRANSACTION */

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

/* CHECK STATUS */

router.get("/status/:id", auth, async (req,res)=>{

try{

const order = await Order.findById(req.params.id)

if(!order){
return res.json({error:"Order không tồn tại"})
}

if(String(order.userId) !== req.user.id){
return res.json({error:"Không có quyền"})
}

const status = await checkStatus(order.apiOrderId)

order.status = status.status

await order.save()

res.json(status)

}catch(err){

res.status(500).json({error:"Server error"})

}

})

/* USER ORDERS */

router.get("/my", auth, async (req,res)=>{

const orders = await Order
.find({userId:req.user.id})
.sort({createdAt:-1})

res.json(orders)

})

module.exports = router
