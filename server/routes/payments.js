const express = require("express")
const multer = require("multer")

const auth = require("../middleware/auth")

const Payment = require("../models/Payment")

const router = express.Router()

const upload = multer({ dest: "uploads/" })

router.post("/deposit", auth, upload.single("bill"), async (req, res) => {

  const payment = new Payment({

    userId: req.user.id,
    amount: req.body.amount,
    billImage: req.file.path

  })

  await payment.save()

  res.json({ message: "Đã gửi bill, chờ admin duyệt" })

})

module.exports = router
