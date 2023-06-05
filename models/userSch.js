const mongoose=require("mongoose")
require("../db/conn.js")

const sch=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    seenupto:Number
    
})

const model=mongoose.model("userDet",sch)

module.exports=model