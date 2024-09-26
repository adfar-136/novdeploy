const express = require("express")
const userModel = require("../models/userr")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppliedOppurtunity = require("../models/Applied");
const router = express.Router()

router.post("/signup",async (req,res)=>{
    const {username,email,password}=req.body;
    const user = await userModel.findOne({email})
    if(user){
        return res.status(400).json({message:"Email already exists"})
    }
    const hashedPass = await bcrypt.hash(password,10)
    const newUser = new userModel({
        username,
        email,
        password:hashedPass
    })
    await newUser.save()
    return res.json({status:true,message:"user is created"})
})
router.post("/login",async (req,res)=>{
    const {email,password}=req.body;
    const user = await userModel.findOne({email})
    if(!user){
        return res.status(400).json({message:"Email does not exist"})
    }
    const validPassword = await bcrypt.compare(password,user.password)
    if(!validPassword){
        return res.status(400).json({message:"password is incorrect"})
    }
     const token = jwt.sign({email:user.email},"jwtkey",{expiresIn:"5h"})
    //  console.log(token)
    //  res.send(token)
    res.cookie("token",token)
    return res.json({status:true,message:"Login Successful",token})
})
const verifyUser = async (req,res,next)=>{
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({message:"token is missing"})
        }
        const decoded = jwt.verify(token,"jwtkey");
        req.user = decoded;
        next()
    } catch (error) {
        console.log(error)
    }
}
router.post("/apply",verifyUser,async (req,res)=>{
    try {
        const {oppurtunity} = req.body;
        // console.log(req.user)
        // console.log(oppurtunity.id)
        const applyOppurtunity = new AppliedOppurtunity({
            userId:req.user.email,
            id:oppurtunity.id,
            profile_name:oppurtunity.profile_name,
            stipend:oppurtunity.stipend.salary,
            company_name:oppurtunity.company_name,
            duration:oppurtunity.duration
        })
        await applyOppurtunity.save();
        res.status(201).json({message:"oppurtunity applied successfully"})
    } catch (error) {
        res.status(500).json({error:"internal server error"})
    }
})
router.get("/applied-oppurtunities",verifyUser,async(req,res)=>{
     try {
        const appliedOppurtunities = await AppliedOppurtunity.find({userId:req.user.email})
        res.json(appliedOppurtunities)
     } catch (error) {
        res.status(500).json("internal server error")
     }
})
router.get("/verify",verifyUser,(req,res)=>{
    return res.json({status:true,message:"Auth Successful",user:req.user})
})
router.get("/logout",(req,res)=>{
    res.clearCookie("token")
    return res.json({status:true,message:"Logged out successfully"})
})
module.exports = router