const express = require("express")
const auth = require("../middleware/auth")

const services = require("../config/services")

const router = express.Router()

router.get("/", auth, (req, res) => {

  res.json(services)

})

module.exports = router
