const mongoose=require("mongoose")

const sch=new mongoose.Schema({
    idpost:Number
})

const model=mongoose.model("uniqueidC",sch)

module.exports=model