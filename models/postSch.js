const mongoose=require("mongoose");
require("../db/conn.js")

const sch=new mongoose.Schema({
    image:String,
    owner:String,
    ratings:Number,
    comments:Array,
    uniqueid:Number
})

const model=mongoose.model("post",sch)

module.exports=model
