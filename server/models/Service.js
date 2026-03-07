const mongoose = require("mongoose")

const ServiceSchema = new mongoose.Schema({

service: Number,

name: String,

rate: Number,

min: Number,

max: Number,

enabled: {
type: Boolean,
default: true
}

})

module.exports = mongoose.model("Service", ServiceSchema)
