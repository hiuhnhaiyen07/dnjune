const express = require("express")
const auth = require("../middleware/auth")

const Transaction = require("../models/Transaction")

const router = express.Router()

router.get("/history",auth,async(req,res)=>{

const tx = await Transaction.find({
userId:req.user.id
}).sort({createdAt:-1})

res.json(tx)

})

module.exports = router
