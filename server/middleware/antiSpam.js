const Order = require("../models/Order")

module.exports = async function(req,res,next){

const userId = req.user.id

const lastOrders = await Order.find({
userId
}).sort({createdAt:-1}).limit(5)

if(lastOrders.length >= 5){

const now = Date.now()
const lastTime = new Date(lastOrders[0].createdAt).getTime()

if(now - lastTime < 10000){
return res.json({
error:"Bạn đang đặt đơn quá nhanh"
})
}

}

next()

}
