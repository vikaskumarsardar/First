const {AdminModel,UserModel} = require('../models')
const jwt = require('jsonwebtoken')
const path = require('path')
exports.adminRegister = async(req,res) =>{
    try{
        const doesExist  = await AdminModel.findOne({$or:[{username:req.body.username},{email:req.body.email}]})
        // if(doesExist.length > 0) return res.status(400).json({message:"User with same email or username already exists"})
        if(doesExist) return res.status(400).json({message:"User with same email or username already exists"})
        const newUser = new AdminModel(req.body)
        const accesstoken = await jwt.sign({_id:newUser._id,username:newUser.username,isAdmin:newUser.isAdmin},process.env.SECRET,{expiresIn:"2h"})
        newUser.accessToken = accesstoken
        const savedUser = await newUser.save()
        res.status(201).json({message:"Admin succesfully registered ",data:savedUser})
            
    }catch(err){
        res.status(500).send("Internal Server Error")
    }
    
}
exports.adminLogin = async(req,res) =>{
    try{
        const doesUserExist = await AdminModel.findOne({$or:[{username:req.body.username},{email:req.body.email}]})
        if(!doesUserExist) return res.status(400).json({message:"User not found"})
        if(!doesUserExist.isValid(req.body.password)) return res.status(400).json({message:"username or password incorrect"})
        const accesstoken = await jwt.sign({_id:doesUserExist._id,username:doesUserExist.username,isAdmin:doesUserExist.isAdmin},process.env.SECRET,{expiresIn:"2h"})
        doesUserExist.accessToken = accesstoken
        const saved = await doesUserExist.save()
        res.status(200).json({message:`welcome ${saved.username}`,oldToken:doesUserExist.accessToken,newToken:saved.accessToken}) 

    }catch(err){
        res.status(500).send("Internal Server Error")
    }
}


exports.blockUnblock = async(req,res) =>{
    try{
        // !undefined
        // !false
        // if(!req.body.isBlocked)
        const isUpdated = await UserModel.findOneAndUpdate({_id:req.body._id},{isBlocked:req.body.isBlocked},{new:true})
        res.status(200).json({message:isUpdated.isBlocked ? `${isUpdated.username} is blocked` : `Unblocked ${isUpdated.username}` })

    }catch(err){
        res.status(500).send("Internal Server Error")
    }

}
exports.deleteUser = async(req,res,next) =>{
    try{
        const isUpdated = await UserModel.findOneAndUpdate({_id:req.body._id},{isDeleted:true},{new:true})
        if(!isUpdated) return res.status(400).json({message:"No Users Found"})
        res.status(200).json({message:`You Deleted ${isUpdated.firstname} ${isUpdated.lastname}`  })

    }catch(err){
        next(err);
        // res.status(500).send("Internal Server Error")
    }

}
exports.activateDeactivateUser = async(req,res) =>{
    try{
        const isUpdated = await UserModel.findOneAndUpdate({_id:req.body._id},{isActive:req.body.isActive},{new:true})
        res.status(200).json({message:isUpdated.isActive ? `${isUpdated.username} is Active` : `${isUpdated.username} is deactivated`  })
    }catch(err){
        res.status(500).send("Internal Server Error")
    }

}


exports.UploadOne = async(req,res) =>{
    try{
        const foundUser = await AdminModel.findOne({_id:req.token._id})
        const files = `/static/admin/${req.file.path.split('\\')[2]}`
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
        const foundUser = await AdminModel.findOne({_id:req.token._id})
        const imageArr = req.files.map(resp =>{
            return `/static/admin/${resp.path.split('\\')[2]}`
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
        console.log(req.files);
        res.status(200).json({message:"uploded Fields "})
    }
    catch(err){
        return res.status(500).send("Internal Server Error")
    }
   }



   