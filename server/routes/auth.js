const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("../models/User")

const router = express.Router()

/* REGISTER */

router.post("/register", async (req, res) => {

  const { username, email, password } = req.body

  if (username.length < 4) {
    return res.json({ error: "Username tối thiểu 4 ký tự" })
  }

  if (password.length < 6) {
    return res.json({ error: "Password tối thiểu 6 ký tự" })
  }

  const exists = await User.findOne({ username })

  if (exists) {
    return res.json({ error: "Username đã tồn tại" })
  }

  const hash = await bcrypt.hash(password, 10)

  const user = new User({
    username,
    email,
    password: hash
  })

  await user.save()

  res.json({ message: "Đăng ký thành công" })

})

/* LOGIN */

router.post("/login", async (req, res) => {

  const { username, password } = req.body

  const user = await User.findOne({ username })

  if (!user) {
    return res.json({ error: "User không tồn tại" })
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    return res.json({ error: "Sai mật khẩu" })
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  res.json({
    token,
    user
  })

})

module.exports = router
