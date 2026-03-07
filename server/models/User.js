const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

username:{
type:String,
required:true,
unique:true,
trim:true,
minlength:4
},

email:{
type:String,
required:true,
unique:true,
lowercase:true,
trim:true
},

password:{
type:String,
required:true
},

balance:{
type:Number,
default:0
},

role:{
type:String,
default:"user"
},

isBlocked:{
type:Boolean,
default:false
},

createdAt:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model("User",UserSchema)
