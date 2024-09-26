const express = require("express");
const mongoose = require("mongoose")
const router = require("./routes/user")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const app = express();
app.use(cookieParser())

app.use(cors(
    {   
        origin:["http://localhost:3000"],
        methods:["GET","POST","PUT","DELETE"],
        credentials:true
    }
))
app.use(express.json())
mongoose.connect("mongodb+srv://adfarrasheed136:Margaret2476@cluster0.ashzien.mongodb.net/kuchbhi").then(()=>{
    console.log("Connected to MongoDB")
})
app.use("/auth",router)
app.listen(4000,()=>{
    console.log("server is running on port 4000")
})