const express = require("express")

const services = require("../config/services")

const router = express.Router()

/* =========================
   GET SERVICES
========================= */

router.get("/", (req, res) => {

try{

let list = []

services.forEach(category => {

category.services.forEach(s => {

list.push({

_id: s.id,
name: s.name,
rate: s.rate,
min: s.min,
max: s.max,
provider: s.provider,
category: category.category,
enabled: true

})

})

})

res.json(list)

}catch(err){

res.status(500).json({
error:"Server error"
})

}

})

module.exports = router
