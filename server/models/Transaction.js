const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

type:{
type:String,
enum:["deposit","order","refund","admin_add","admin_sub"],
required:true
},

amount:{
type:Number,
required:true
},

note:{
type:String,
default:""
},

createdAt:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model("Transaction",TransactionSchema)
