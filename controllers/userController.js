const {userModel} = require('../modals')
const jwt = require('jsonwebtoken')
exports.userRegister = async(req,res) =>{
    try{
        const doesExist  = await userModel.find({$or:[{username:req.body.username},{email:req.body.email}]})
        if(doesExist.length > 0) return res.status(400).json({message:"User with same email or username already exists"})
        const newUser = new userModel(req.body)
        const savedUser = await newUser.save()
        if(savedUser){
            const accesstoken = await jwt.sign({_id:savedUser._id,username:savedUser.username},process.env.SECRET)
            res.status(201).json({message:"User succesfully registered ",accesstoken:accesstoken,data:savedUser})
        }
            
    }catch(err){
        res.status(500).send("Internal Server Error")
    }
    
}