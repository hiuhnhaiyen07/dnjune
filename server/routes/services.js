const express = require("express")
const auth = require("../middleware/auth")

const servicesConfig = require("../config/services")

const router = express.Router()

router.get("/", auth, (req,res)=>{

let list=[]

servicesConfig.forEach(cat=>{

cat.services.forEach(s=>{

list.push({
service:s.id,
name:s.name,
rate:s.rate,
min:s.min,
max:s.max,
provider:s.provider,
category:cat.category
})

})

})

res.json(list)

})

module.exports = router
