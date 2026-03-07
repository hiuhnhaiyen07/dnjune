const mongoose = require("mongoose")

const TicketSchema = new mongoose.Schema({

userId:String,

subject:String,

status:{
type:String,
default:"open"
},

messages:[
{
sender:String,
message:String,
date:{
type:Date,
default:Date.now
}
}
],

createdAt:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model("Ticket",TicketSchema)
