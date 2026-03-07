const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/auth")
const orderRoutes = require("./routes/orders")
const paymentRoutes = require("./routes/payments")
const adminRoutes = require("./routes/admin")
const serviceRoutes = require("./routes/services")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/uploads", express.static("uploads"))

app.use("/api/auth", authRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/services", serviceRoutes)

mongoose.connect(process.env.MONGO_URI)

.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err))

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})
