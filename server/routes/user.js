const express = require("express")
const auth = require("../middleware/auth")
const User = require("../models/User")

const router = express.Router()

router.get("/me", auth, async (req,res)=>{

const user = await User.findById(req.user.id)

res.json({
username:user.username,
balance:user.balance,
email:user.email
})

})

module.exports = router
