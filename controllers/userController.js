const {UserModel} = require('../models')
const jwt = require('jsonwebtoken')
const { twilio } = require('../services/')
exports.userRegister = async(req,res,next) =>{
    try{
        const doesExist  = await UserModel.findOne({$or:[{username:req.body.username},{email:req.body.email},{phone : req.body.phone}]});
        if(doesExist) return res.status(400).json({message:"User with same email or username already exists"})
        const newUser = new UserModel(req.body)
        const accesstoken = await jwt.sign({_id:newUser._id},process.env.SECRET,{expiresIn:"2h"})
        newUser.accessToken = accesstoken
        console.log(req.body);
        const OTP = await twilio(req.body.countryCode)    
        newUser.OTP = OTP
        const savedUser = await newUser.save()
        res.redirect('/api/user/verify')
        // res.status(201).json({message:"User succesfully registered and you should redirected to the Login ",data:savedUser})
            
    }catch(err){
        res.status(500).send("Internal Server Error")
    }
    
}
exports.userLogin = async(req,res) =>{
    try{
        const doesExist  = await UserModel.findOne({$or:[{username:req.body.username},{email:req.body.email}]})
        if(!doesExist || doesExist.isDeleted) return res.status(400).json({message:"User Not Found"})
        if(!doesExist.isPhoneVerified){
           return res.redirect('/api/user/verify');
        } 
        if(!doesExist.isValid(req.body.password)) return res.status(400).json({message:"username or password Incorrect"})
        if(doesExist.isBlocked) return res.status(401).send("You are blocked by the admin")
        const accesstoken = await jwt.sign({_id:doesExist._id},process.env.SECRET,{expiresIn:"2h"})
        doesExist.accessToken = accesstoken
        const savedUser = await doesExist.save()
        res.status(201).json({message:`Welcome ${savedUser.username} `,data:savedUser})
    }catch(err){
        res.status(500).send("Internal Server Error")
    }
    
}


exports.activateDeactivate = async(req,res) =>{
    try{
        const updated = await UserModel.findOneAndUpdate(req.params._id,{isActive:req.body.isActive},{new:true})
        res.status(200).json({message: updated.isActive ? 'successfully activated' : 'successfully deactivated' })
    }
    catch(err){
        res.status(500).send("Internal Server Error")
    }
    
    
}
// exports.blockUnblock = async(req,res) =>{
//     try{
//         const updated = await AdminModel.findByIdAndUpdate(req.params._id,{isblocked:req.body.isBlocked},{new:true})
//         res.status(200).json({message: updated.isBlocked ? 'successfully blocked' : 'successfully unBlocked' })
//     }
//     catch(err){
//         res.status(500).send("Internal Server Error")
//     }
    
    
// }


exports.UploadOne = async(req,res) =>{
    try{
        const foundUser = await UserModel.findOne({_id:req.token._id})
        const files = `/static/users/${req.file.path.split('\\')[2]}`
        foundUser.image.push(files)
        const saved = await foundUser.save()
        res.status(200).json({message:"you have just uploaded One image",images:files})
    }
    catch(err){
        return res.status(500).send("Internal Server Error")
    }
    
    
    
}
exports.UploadMany = async(req,res) =>{
    try{
        const foundUser = await UserModel.findOne({_id:req.token._id})
        const imageArr = req.files.map(resp =>{
            return `/static/users/${resp.path.split('\\')[2]}`
        })

        foundUser.image = [...foundUser.image,...imageArr]
        await foundUser.save()
        res.status(200).json({message: `you have just uploaded following images `,images : imageArr })
    }
    catch(err){
        return res.status(500).send("Internal Server Error")
    }
    
    
    
}
exports.UploadFields = async(req,res) =>{
    try{
        const arr = Array.from(req.files)
        // console.log(arr);
        console.log(req.files);
        res.status(200).json({message:"welcome to the userUpload Fields "})
    }
    catch(err){
        return res.status(500).send("Internal Server Error")
    }
    
}

exports.Verify = async(req,res) =>{
    try{
        const userFound = await UserModel.findOne({$and:[{phone:req.body.phone},{counrtyCode:req.body.counrtyCode}]})
        if(!userFound) return res.status(400).json({message:"No User Found to be verified"})
        if(userFound !== req.body.OTP) {
            const OTP = await twilio(req.body.counrtyCode,req.body.phone)
            userFound.OTP = OTP
            await userFound.save()
            return res.redirect('/api/user/verify')
        }
        userFound.isPhoneVerified = true
        await userFound.save()

        res.redirect('/api/login')
        // res.status(200).send("redirect ")
    }
    catch(err){
        res.status(500).send("Internal Server Error")
    }
}


