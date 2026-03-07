const express = require("express")
const auth = require("../middleware/auth")

const Ticket = require("../models/Ticket")

const router = express.Router()

/* CREATE TICKET */

router.post("/create",auth,async(req,res)=>{

const {subject,message}=req.body

const ticket = new Ticket({

userId:req.user.id,
subject,

messages:[
{
sender:"user",
message
}
]

})

await ticket.save()

res.json({message:"Ticket created"})

})

/* USER TICKETS */

router.get("/my",auth,async(req,res)=>{

const tickets = await Ticket.find({
userId:req.user.id
}).sort({createdAt:-1})

res.json(tickets)

})

/* REPLY */

router.post("/reply/:id",auth,async(req,res)=>{

const ticket = await Ticket.findById(req.params.id)

ticket.messages.push({
sender:"user",
message:req.body.message
})

await ticket.save()

res.json({message:"Replied"})

})

module.exports = router
