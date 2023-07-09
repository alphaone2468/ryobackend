const mongoose=require("mongoose")

const sch=new mongoose.Schema({
    user:String,
    following:Array,
    followers:Number
})

const model = mongoose.model("following",sch)

module.exports=model