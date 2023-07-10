const express=require("express")
const cors=require("cors")
const app=express()
const dotenv=require("dotenv")
const bodyParser=require('body-parser')
app.use(bodyParser.urlencoded({extended:true,limit:'500mb'}))
app.use(bodyParser.json({limit:'500mb'}))
require("./db/conn.js")
const users=require("./models/userSch.js")
const post=require("./models/postSch.js")
const uniqueidc=require("./models/UniqueidSch.js")
const followcoll=require("./models/followingSch.js")


app.use(cors())
dotenv.config({
    path:"./config.env"
})
const port=process.env.PORT


app.get("/",(req,resp)=>{
    resp.send("i am home")
})
app.post("/getpost",async(req,resp)=>{
    console.log(req.body)
    const user=req.body.email
    const datan=await users.find({email:req.body.email})     
    try{    
    let seenupto=datan[0].seenupto
    const getuniqueid=await uniqueidc.find();
    let maxpost=getuniqueid[0].idpost
    console.log(seenupto)
    console.log(maxpost)
    let usut;
    if(seenupto>maxpost){
        usut=1;
        seenupto=1;
    }
    else{
        usut=seenupto + 10;
    }

    const data=await post.find().limit(10).skip(seenupto-1)
    const up=await users.updateOne({email:req.body.email},{$set:{seenupto:usut}})
    // console.log(data)
    resp.send(data)
}
    catch{
        resp.send({"message":"error"})
    }
})

app.post("/reg",async (req,resp)=>{
    console.log(req.body)
    if(req.body.username && req.body.email && req.body.password && req.body.seenupto){
        const check=await users.find({email:req.body.email})
        const checkusername=await users.find({username:req.body.username})
        console.log(checkusername);
        if(check.length!=0 || checkusername.length!=0){
            var message="email exist";
            if(check.length==0){
                message="username exist"
            }
            resp.send({"error":message})
        }
        else{
            const data=new users(req.body)
            const res=await data.save()
            console.log(res)
            resp.send({"success" : "done"})
        }
    }
    else{
        resp.send({"error":"A field is missing"})
    }
})
app.post("/login",async(req,resp)=>{
    console.log(req.body)
    if(req.body.email && req.body.password){
        const check=await users.find({email:req.body.email,password:req.body.password})
        if(check.length==0){
            resp.send({"error":"Invalid Details"})
        }
        else{
            resp.send({"success" : check[0].username,'email':check[0].email})
        }
    }
    else{
        resp.send("A field is missing")
    }
    
})

app.post("/postimage",async(req,resp)=>{
    console.log(req.body)
    if(req.body.owner && req.body.image && req.body.ratings && req.body.comments){
        const uniqueid=await uniqueidc.find()
        console.log(uniqueid)
        const obj=uniqueid[0]
        console.log(obj.idpost)
        const idp = obj.idpost
        const objsend={
            owner:req.body.owner,
            image:req.body.image,
            ratings:req.body.ratings,
            comments:req.body.comments,
            uniqueid:idp
        }
        console.log(objsend)
        const data=new post(objsend)
        const res=await data.save()
        console.log(res)
        const updateid=await uniqueidc.updateOne({_id:"6478cb7bcf428b46c1a78c54"},{$set:{idpost:obj.idpost+1}})
        console.log(updateid)
        
        resp.send({"success":"up"})
    }
    else{
        resp.send({"error":"failed"})
    }
})

app.put("/updatepost",async(req,resp)=>{
    console.log(req.body)
    const data = await post.find({uniqueid:req.body.id})
    console.log(data)
    var ratingsn=data[0].comments[0].ratings
    console.log(ratingsn)
    ratingsn.push(req.body.ratinggiven)
    console.log(ratingsn)
    var countf=data[0].comments[1].count + 1
    const dataa = await post.updateOne({uniqueid:req.body.id},{$set:{comments:[{ratings:ratingsn},{count:countf}]}})
    resp.send({"message":"updated"})
})

app.get("/timepass",async(req,resp)=>{
    resp.send(" i am timepass new upadted")
    const data = await post.find().limit(5).skip(5)
    console.log(data.length)
    data.filter((e)=>{
        console.log(e.uniqueid)
    })
})

app.put("/comment",async(req,resp)=>{
    const data=await post.find({uniqueid:req.body.id})
    console.log(data)
    const c = data[0].comments
    console.log(c)
    console.log(typeof(c))
    const obj={
        comment:req.body.comment,
        name:req.body.name
    }
    c.push(obj)
    console.log(c);
    const addcomment=await post.updateOne({uniqueid:req.body.id},{$set:{comments:c}})
    console.log(addcomment)
    resp.send({"success":"comment posted"})
})

app.post("/getcomments",async(req,resp)=>{
    console.log(req.body)
    const data=await post.find({uniqueid:req.body.user})
    console.log(data[0])
    resp.send({"message":data})
})

app.post("/yourpost",async(req,resp)=>{
    console.log(req.body)
    const res = await post.find({owner:req.body.name});
    console.log(res);
    console.log(res.length)
    resp.send(res);
    

})
app.post("/reset",async (req,resp)=>{
    console.log(req.body.email);
    const up=await users.updateOne({email:req.body.email},{$set:{seenupto:1}})
    console.log(up)
    resp.send({"message":"done"})
})

app.post("/searchusers",async (req,resp)=>{
    console.log(req.body.value);
    const data = await users.find({username:{$regex:`^${req.body.value}`,$options:'i'}});
    console.log(data);

    resp.send(data);
})

app.post("/getauserposts",async(req,resp)=>{
    console.log("getauserpost");
    const data = await post.find({"owner":req.body.username})
    console.log(data);
    let followersd=await followcoll.find({user:req.body.username})
    if(followersd.length==0){
        const newuser=new followcoll({user:req.body.username,followers:0})
        const data =await newuser.save();
        console.log(data)
        followersd=[data];
    }
    console.log(followersd[0].followers)
    resp.send([data,followersd[0].followers]);
})

app.get("/goto/:id",async (req,resp)=>{
    console.log(req.params.id);
    const data = await post.find({uniqueid:req.params.id});
    console.log(data)
    resp.send(data)
})
app.post("/getfoll",async (req,resp)=>{
    console.log("calling");
    console.log(req.body);
    const data = await followcoll.find({"user":req.body.user})
    console.log(data);
    if(data.length==0){
        const newuser=new followcoll({"user":req.body.user,"followers":0})
        const res = await newuser.save();
        console.log(res);
        const data = await followcoll.find({"user":req.body.user})
        console.log(data);
        resp.send(data); 
    }
    else{
        resp.send(data); 
    }
    
})
app.post("/addfollow",async (req,resp)=>{
    console.log(req.body);
    let data=await followcoll.find({user:req.body.user});
    // console.log(data);
    // console.log(data[0])
    console.log("hell0")
    if(data.length==0){
        console.log("new create")
        const adduser = await new followcoll({user:req.body.user,followers:0})
        const res=await adduser.save();
        console.log(res)
        data=[res];
    }
    console.log(data);
    const newfollowarray = [...data[0].following]
    // console.log(newfollowarray)
    newfollowarray.unshift(req.body.followed)
    console.log(newfollowarray)
    const update=await followcoll.updateOne({user:req.body.user},{$set:{following:newfollowarray}})
    console.log(update)

    //updating follwers
    let getOldFollowersData=await followcoll.find({user:req.body.followed})
    console.log(getOldFollowersData)
    if(getOldFollowersData.length==0){
        const newuser=new followcoll({user:req.body.followed,followers:0})
        const data=await newuser.save();
        console.log(data);
        getOldFollowersData=[data];
    }
    let oldfollowers=getOldFollowersData[0].followers
    let newfollowers=oldfollowers+1;
    const updatefollwers=await followcoll.updateOne({user:req.body.followed},{$set:{followers:newfollowers}})

    resp.send({"message":"done"});
})
app.listen(port,()=>{
    console.log(`server running at ${port}`)
})

