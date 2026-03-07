require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")
const rateLimit = require("express-rate-limit")

const connectDB = require("./config/db")

const authRoutes = require("./routes/auth")
const serviceRoutes = require("./routes/services")
const orderRoutes = require("./routes/orders")
const paymentRoutes = require("./routes/payments")
const adminRoutes = require("./routes/admin")
const notificationRoutes = require("./routes/notifications")
const ticketRoutes = require("./routes/tickets")
const resellerRoutes = require("./routes/reseller")

const app = express()

connectDB()

/* RATE LIMIT */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
})

app.use(limiter)

/* MIDDLEWARE */

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, "../public")))

/* ROUTES */

app.use("/api/auth", authRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/reseller", resellerRoutes)

/* HOME PAGE */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"))
})

/* CRON */

require("./utils/cron")

/* SERVER */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on " + PORT)
})
