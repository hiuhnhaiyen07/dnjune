const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const authRoutes = require("./routes/auth")
const orderRoutes = require("./routes/orders")
const paymentRoutes = require("./routes/payments")
const adminRoutes = require("./routes/admin")
const serviceRoutes = require("./routes/services")

const app = express()

/* =========================
   MIDDLEWARE
========================= */

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

/* =========================
   STATIC FILES
========================= */

app.use("/uploads", express.static(path.join(__dirname,"uploads")))

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/services", serviceRoutes)

/* =========================
   TEST ROUTE
========================= */

app.get("/",(req,res)=>{
res.send("SMM Panel API running")
})

/* =========================
   MONGODB
========================= */

mongoose.connect(process.env.MONGO_URI,{
useNewUrlParser:true,
useUnifiedTopology:true
})
.then(()=>{
console.log("MongoDB connected")
})
.catch(err=>{
console.log("MongoDB error:",err)
})

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})
