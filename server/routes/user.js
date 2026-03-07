const express = require("express")
const auth = require("../middleware/auth")
const User = require("../models/User")

const router = express.Router()

/* GET USER INFO */

router.get("/me", auth, async (req,res)=>{

try{

const user = await User.findById(req.user.id)

if(!user){
return res.json({error:"User không tồn tại"})
}

res.json({
username:user.username,
balance:user.balance,
email:user.email
})

}catch(err){

res.status(500).json({error:"Server error"})

}

})

module.exports = router
