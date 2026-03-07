const mongoose = require("mongoose")

const ApiKeySchema = new mongoose.Schema({

userId:String,

key:String,

createdAt:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model("ApiKey",ApiKeySchema)
