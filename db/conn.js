const mongoose=require("mongoose")
const dotenv=require("dotenv")
dotenv.config({
    path:"./config.env"
})
const dbvalue=process.env.DATABASE
mongoose.connect(dbvalue).then((msg)=>{
    console.log("connection sucessfull")
}).catch((error)=>{
    console.log("not connected")
})