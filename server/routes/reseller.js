const express = require("express")

const ApiKey = require("../models/ApiKey")
const User = require("../models/User")
const Order = require("../models/Order")

const router = express.Router()

/* CREATE ORDER VIA API */

router.post("/order",async(req,res)=>{

const {key,service,link,quantity}=req.body

const api=await ApiKey.findOne({key})

if(!api){
return res.json({error:"Invalid API key"})
}

const user=await User.findById(api.userId)

if(user.balance<1000){
return res.json({error:"Insufficient balance"})
}

const order=new Order({

userId:user._id,
service,
link,
quantity,
price:1000,
status:"processing"

})

await order.save()

user.balance-=1000

await user.save()

res.json({

order:order._id

})

})

module.exports = router
