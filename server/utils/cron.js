const cron=require("node-cron")

const Order=require("../models/Order")
const {checkStatus}=require("./smmApi")

cron.schedule("*/5 * * * *",async()=>{

console.log("Checking orders...")

const orders=await Order.find({status:"processing"})

for(const o of orders){

const status=await checkStatus(o.apiOrderId)

o.status=status.status

await o.save()

}

})
