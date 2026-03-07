const express = require("express")
const Service = require("../models/Service")
const auth = require("../middleware/auth")

const router = express.Router()

router.get("/", auth, async (req, res) => {

  try {

    const services = await Service.find({ enabled: true })

    res.json(services)

  } catch (err) {

    res.status(500).json({ error: "Server error" })

  }

})

module.exports = router
