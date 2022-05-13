const {UserModel, AdminModel} = require('../models')
const jwt = require('jsonwebtoken')
const { twilio,nodeMailer } = require('../services/')

exports.userRegister = async(req,res,next) =>{
    try{
        const doesExist  = await UserModel.findOne({$or:[{username:req.body.username},{email:req.body.email},{phone : req.body.phone}]});
        if(doesExist) return res.status(400).json({message:"User with same email or username already exists"})
        const newUser = new UserModel(req.body)
        const accesstoken = await jwt.sign({_id:newUser._id},process.env.SECRET,{expiresIn:"2h"})
        newUser.accessToken = accesstoken
        console.log(req.body.verifyMethod);
        if(req.body.verifyMethod == 'phone'){
            const OTP = await twilio(req.body.countryCode,req.body.phone)    
            newUser.OTP = OTP
            newUser.verifyMethod = "phone"
        }
        else if(req.body.verifyMethod == "email"){
            const info = await nodeMailer(req.body.email)
            newUser.emailOTP = info
            newUser.verifyMethod = "email"
        }


        const savedUser = await newUser.save()
        // res.redirect('/api/user/verify')
        return res.status(201).json(savedUser)
            
    }catch(err){
        res.status(500).send("Internal Server Error")
    }
    
}
exports.userLogin = async(req,res) =>{
    try{
        const doesExist  = await UserModel.findOne({$or:[{username : req.body.username},{email : req.body.username},{$and : [{phone : req.body.username},{countryCode : req.body.countryCode}]}]})
        if(!doesExist || doesExist.isDeleted) return res.status(400).json({message:"User Not Found"})
        if(!doesExist.isValid(req.body.password)) return res.status(400).json({message:"Username or Password Incorrect!"})
        if((doesExist.verifyMethod == "email" && !doesExist.isEmailVerified) || (doesExist.verifyMethod == "phone" && !doesExist.isPhoneVerified)) return res.status(400).json({message:"Your account is not verified"});
        
        
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
        const userFound = await UserModel.findOne({$or:[{$and : [{phone : req.body.phone},{countryCode : req.body.countryCode}]},{email : req.body.email},{emailOTP : req.params.user}]})
        if(!userFound) return res.status(400).json({message:"No User Found"})

        if(userFound.verifyMethod == 'email'){
            if(userFound.emailOTP !== req.params.user) return res.status(400).json({message:"Incorrect Email String"})
                userFound.isEmailVerified = true
        }
        else if(userFound.verifyMethod == 'phone'){

            if(userFound.OTP !== req.body.OTP) return res.status(400).json({message:"Invalid OTP"})
            userFound.isPhoneVerified = true
        }
        const saved = await userFound.save()
        res.status(200).json(`Mr. ${saved.firstname} you have successfully verified your account`)    

    }
    catch(err){
        res.status(500).send("Internal Server Error")
    }
}


exports.forgetPassword = async(req,res) =>{
    try{
        const token = uuidv1()
        const userFound = await AdminModel.findOneAndUpdate({$or : [{email:req.body.username},{username : req.body.username},{$and:[{phone:req.body.username},{countryCode : req.body.countryCode}]}]},{
            forgetToken : token,
            // forgetTokenExpire : Date.now() + 
        })
        if(!userFound) return res.status(400).send("No Users Found")
        
        
        
        
    }
    catch(err){
        res.status(500).send("Internal Server Error")
    }
}


exports.ResetPassword = async(req,res) =>{
    try{

    }
    catch(err){
        res.status(500).send("Internal Server Error")
    }
}


