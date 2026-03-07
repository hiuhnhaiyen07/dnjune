const express=require("express")
const auth=require("../middleware/auth")

const Notification=require("../models/Notification")

const router=express.Router()

router.get("/",auth,async(req,res)=>{

const data=await Notification.find({
userId:req.user.id
}).sort({createdAt:-1})

res.json(data)

})

module.exports=router
