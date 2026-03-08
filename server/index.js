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
const userRoutes = require("./routes/user")

// Import middleware bảo vệ admin (nếu chưa import ở file khác)
const auth = require("./middleware/auth")
const admin = require("./middleware/admin")

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

/* ROUTES API */
app.use("/api/auth", authRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/reseller", resellerRoutes)
app.use("/api/user", userRoutes)

/* STATIC FILES */
app.use(express.static(path.join(__dirname, "../public")))
app.use(express.static(path.join(__dirname, "../views")))

// Import middleware (nếu chưa có ở đầu file, thêm dòng này)
const auth = require("./middleware/auth");
const admin = require("./middleware/admin");

// Route cho trang admin dashboard
app.get("/admin", auth, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard.html"));
});

// Optional: cho các trang admin khác nếu có trong views/admin/ (hiện repo không có folder admin/)
app.get("/admin/:page", auth, admin, (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, `../views/\( {page}.html`); // hoặc ../views/admin/ \){page}.html nếu có folder
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send("Trang không tồn tại");
  });
});

/* ADMIN DASHBOARD ROUTES */
// Trang chính admin: /admin → dashboard.html
app.get("/admin", auth, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard.html"))
})

// Các trang con trong views/admin/ (nếu có, ví dụ /admin/users, /admin/payments)
app.get("/admin/:page", auth, admin, (req, res) => {
  const page = req.params.page
  const filePath = path.join(__dirname, `../views/admin/${page}.html`)
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Không tìm thấy trang:", err.path)
      res.status(404).send("Trang không tồn tại")
    }
  })
})

/* HOME PAGE */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"))
})

/* CRON JOBS */
require("./utils/cron")

/* SERVER START */
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
