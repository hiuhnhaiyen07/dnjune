const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("../models/User")

const router = express.Router()

/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {
  try {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.json({ error: "Thiếu thông tin" })
    }

    /* CHECK USERNAME */

    const userExist = await User.findOne({ username })
    if (userExist) {
      return res.json({ error: "Username đã tồn tại" })
    }

    /* CHECK EMAIL */

    const emailExist = await User.findOne({ email })
    if (emailExist) {
      return res.json({ error: "Email đã tồn tại" })
    }

    /* HASH PASSWORD */

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      email,
      password: hashedPassword
    })

    await user.save()

    res.json({ message: "Đăng ký thành công" })

  } catch (err) {

    console.log(err)
    res.status(500).json({ error: "Lỗi server" })

  }
})

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {

    const { username, password } = req.body

    if (!username || !password) {
      return res.json({ error: "Thiếu thông tin" })
    }

    /* TÌM USER THEO USERNAME HOẶC EMAIL */

    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    })

    if (!user) {
      return res.json({ error: "Tài khoản không tồn tại" })
    }

    /* SO SÁNH PASSWORD */

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.json({ error: "Sai mật khẩu" })
    }

    /* TẠO TOKEN */

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    )

    /* TRẢ VỀ USER + ROLE */

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

  } catch (err) {

    console.log(err)
    res.status(500).json({ error: "Login lỗi" })

  }
})

module.exports = router
