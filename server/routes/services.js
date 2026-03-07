const express = require("express")
const auth = require("../middleware/auth")

const servicesConfig = require("../config/services")

const router = express.Router()

/* =========================
   GET ALL SERVICES
========================= */

router.get("/", auth, (req, res) => {

try{

let services = []

servicesConfig.forEach(category => {

category.services.forEach(s => {

services.push({

service: s.id,          // ID service
name: s.name,           // tên dịch vụ
rate: s.rate,           // giá /1000
min: s.min,
max: s.max,
provider: s.provider,   // id bên provider
category: category.category

})

})

})

res.json(services)

}catch(err){

console.log(err)

res.status(500).json({
error:"Server error"
})

}

})

module.exports = router
