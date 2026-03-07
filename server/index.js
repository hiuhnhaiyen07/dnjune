require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

const connectDB = require("./config/db")

const authRoutes = require("./routes/auth")
const serviceRoutes = require("./routes/services")
const orderRoutes = require("./routes/orders")
const paymentRoutes = require("./routes/payments")
const adminRoutes = require("./routes/admin")

const app = express()

connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, "../public")))

app.use("/api/auth", authRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.html"))
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

require("./utils/cron")
