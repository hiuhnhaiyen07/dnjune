const express = require("express")
const multer = require("multer")

const auth = require("../middleware/auth")

const Payment = require("../models/Payment")

const router = express.Router()

/* =========================
   UPLOAD CONFIG
========================= */

const storage = multer.diskStorage({

destination: (req,file,cb)=>{
cb(null,"uploads/")
},

filename: (req,file,cb)=>{
cb(null, Date.now() + "-" + file.originalname)
}

})

const upload = multer({storage})

/* =========================
   CREATE DEPOSIT
========================= */

router.post("/deposit", auth, upload.single("bill"), async (req,res)=>{

try{

if(!req.file){
return res.json({error:"Chưa upload bill"})
}

const payment = new Payment({

userId:req.user.id,
amount:req.body.amount,
billImage:req.file.path,
status:"pending"

})

await payment.save()

res.json({
message:"Đã gửi bill, chờ admin duyệt"
})

}catch(err){

res.status(500).json({error:"Server error"})

}

})

/* =========================
   USER PAYMENT HISTORY
========================= */

router.get("/my", auth, async (req,res)=>{

const payments = await Payment
.find({userId:req.user.id})
.sort({createdAt:-1})

res.json(payments)

})

module.exports = router
