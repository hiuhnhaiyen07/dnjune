const mongoose = require("mongoose")

const ServiceSchema = new mongoose.Schema({

serviceId:{
type:Number
},

name:{
type:String
},

category:{
type:String
},

rate:{
type:Number
},

min:{
type:Number
},

max:{
type:Number
},

price:{
type:Number
},

enabled:{
type:Boolean,
default:true
}

})

module.exports = mongoose.model("Service",ServiceSchema)
