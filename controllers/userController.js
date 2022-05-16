const {UserModel, AdminModel} = require('../models')
const jwt = require('jsonwebtoken')
const { twilio,nodeMailer,response,error,send } = require('../services/')
const {Messages} = require('../message/')
const {statusCodes} = require('../statusCodes/')

exports.userRegister = async(req,res,next) =>{
    try{
        const doesExist  = await UserModel.findOne({$or:[{username:req.body.username},{email:req.body.email},{phone : req.body.phone}]});
        if(doesExist) return res.status(statusCodes.badRequest).json({message:Messages.alreadyExists})
        const newUser = new UserModel(req.body)
        const accesstoken = await jwt.sign({_id:newUser._id},process.env.SECRET,{expiresIn:"2h"})
        newUser.accessToken = accesstoken
        console.log(req.body.verifyMethod);
        if(req.body.verifyMethod == Messages.phone){
            const OTP = await twilio(Messages.verfyPhone,req.body.countryCode,req.body.phone)    
            newUser.OTP = OTP
            newUser.verifyMethod = Messages.phone
        }
        else if(req.body.verifyMethod == Messages.email){
            const info = await nodeMailer(Messages.verifyEmail,req.body.email)
            newUser.emailOTP = info
            newUser.verifyMethod = Messages.email
        }


        const savedUser = await newUser.save()
        // res.redirect('/api/user/verify')
        return res.status(statusCodes.created).json({message : Messages.registeredSuccessfully , data : savedUser})
            
    }catch(err){
        res.status(statusCodes.internalServerError).send(Messages.internalServerError)
    }
    
}
exports.userLogin = async(req,res) =>{
    try{
        const doesExist  = await UserModel.findOne({$or:[{username : req.body.username},{email : req.body.username},{$and : [{phone : req.body.username},{countryCode : req.body.countryCode}]}]})
        if(!doesExist || doesExist.isDeleted) return res.status(statusCodes.badRequest).json({message : Messages.userNotFound})
        if(!doesExist.isValid(req.body.password)) return res.status(statusCodes.badRequest).json({message : Messages.passwordIncorrect})
        if((doesExist.verifyMethod == Messages.email && !doesExist.isEmailVerified) || (doesExist.verifyMethod == Messages.phone && !doesExist.isPhoneVerified)) return res.status(statusCodes.badRequest).json({message : Messages.accountNotVerified});
        
        
        if(doesExist.isBlocked) return res.status(statusCodes.UnauthorizedAccess).send(Messages.blockedByAdmin)
        const accesstoken = await jwt.sign({_id:doesExist._id},process.env.SECRET,{expiresIn:"2h"})
        doesExist.accessToken = accesstoken
        const savedUser = await doesExist.save()
        res.status(statusCodes.created).json({message:`${Messages.welcome} ${savedUser.username} `,data:savedUser})

    }catch(err){
        res.status(statusCodes.internalServerError).send(Messages.internalServerError)
    }
    
}


exports.activateDeactivate = async(req,res) =>{
    try{
        const updated = await UserModel.findOneAndUpdate(req.params._id,{isActive:req.body.isActive},{new:true})
        res.status(statusCodes.OK).json({message : updated.isActive ? Messages.activatedSuccessfully : Messages.deactivatedSuccessfully })
    }
    catch(err){
        res.status(statusCodes.internalServerError).send(Messages.internalServerError)
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
        res.status(statusCodes.OK).json({message:Messages.uploadOneImageSuccessfully,images:files})
    }
    catch(err){
        return res.status(statusCodes.internalServerError).send(Messages.internalServerError)
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
        res.status(statusCodes.OK).json({message: Messages.uploadedManyImagesSuccessfully,images : imageArr })
    }
    catch(err){
        return res.status(statusCodes.internalServerError).send(Messages.internalServerError)
    }
    
    
    
}
exports.UploadFields = async(req,res) =>{
    try{
        const arr = Array.from(req.files)
        console.log(req.files);
        res.status(statusCodes.OK).json({message: Messages.uploadedImageFieldSuccessfully})
    }
    catch(err){
        return res.status(statusCodes.internalServerError).send(Messages.internalServerError)
    }
    
}

exports.Verify = async(req,res) =>{
    try{
        const userFound = await UserModel.findOne({$or:[{$and : [{phone : req.body.phone},{countryCode : req.body.countryCode}]},{email : req.body.email},{emailOTP : req.params.user}]})
        if(!userFound) return res.status(statusCodes.badRequest).json({message : Messages.userNotFound})

        if(userFound.verifyMethod == Messages.email){
            if(userFound.emailOTP !== req.params.user) return res.status(statusCodes.badRequest).json({message:Messages.inva})
                userFound.isEmailVerified = true
        }

        else if(userFound.verifyMethod == Messages.phone){

            if(userFound.OTP !== req.body.OTP) return res.status(statusCodes.badRequest).json({message : Messages.invalidOTP})
            userFound.isPhoneVerified = true
        }
        const saved = await userFound.save()
        res.status(statusCodes.OK).json(`Mr. ${saved.firstname} ${Messages.verifiedSuceessfully}`)    

    }
    catch(err){
        res.status(statusCodes.internalServerError).send(Messages.internalServerError)
    }
}


exports.forgetPassword = async(req,res) =>{
    try{
        const userFound = await UserModel.findOne({$or : [{email:req.body.username},{username : req.body.username},{$and : [{phone:req.body.username},{countryCode : req.body.countryCode}]}]})
        if(!userFound) return res.status(statusCodes.badRequest).send(Messages.userNotFound)
        if(!userFound.isEmailVerified && userFound.verifyMethod === Messages.email) return  res.status(400).json({message : Messages.emailNotVerified})
        if( userFound.verifyMethod == Messages.phone && !userFound.isPhoneVerified) return  res.status(400).json({message : Messages.phoneNotVerified})
        if(userFound.verifyMethod == Messages.email && userFound.isEmailVerified){
            const resetToken = await nodeMailer(Messages.forgetPassword,userFound.email)
            userFound.resetToken = resetToken;
            userFound.expireTokenIn = Date.now() + 600000 
        }
        if(userFound.verifyMethod == Messages.phone && userFound.isPhoneVerified){
            const resetToken = await twilio(Messages.forgetPassword,userFound.countryCode,userFound.phone)
            userFound.resetToken = resetToken;
            userFound.expireTokenIn = Date.now() + 600000 
        }
        await userFound.save()
        res.status(statusCodes.OK).json({message : Messages.checkEmail})
        
    }
    catch(err){
        res.status(statusCodes.internalServerError).send(Messages.internalServerError)
    }
}


exports.ResetPassword = async(req,res) =>{
    try{
        if(req.body.password === req.body.confirmPassword){
            const userFound = await UserModel.findOne({resetToken : req.params.token,expireTokenIn : {$gt : Date.now()}})
            if(!userFound) return res.status(statusCodes.badRequest).json({message : Messages.tokenExpired})
            userFound.expireTokenIn = null
            if(!userFound.resetPassword(req.body.password)) return res.status(statusCodes.internalServerError).json({message:Messages.somethingWentWrong})
            await userFound.save()
            return res.status(statusCodes.OK).json({message: Messages.passwordChangedSuccessfully})
            
        }
        return res.status(statusCodes.badRequest).json({message : Messages.passwordAndNewPasswordNotSame})
    }
    catch(err){
        res.status(statusCodes.internalServerError).send(Messages.internalServerError)
    }
}


exports.changePassword = async(req,res) =>{
    try{
        const userFound = await UserModel.findOne({$or : [{email:req.body.username},{username:req.body.username},{$and:[{countryCode:req.body.countryCode},{phone :req.body.username}]}]})
        if(!userFound) return res.status(statusCodes.badRequest).json({message : Messages.userNotFound})
        if(!userFound.isValid(req.body.password)) return res.status(statusCodes.badRequest).json({message : Messages.passwordIncorrect}) 
        if(!userFound.resetPassword(req.body.newPassword)) return res.status(statusCodes.internalServerError).json({message : Messages.somethingWentWrong})
        await userFound.save()
        res.status(statusCodes.OK).json({message : Messages.passwordChangedSuccessfully})
        
    }catch(err){
        res.status(statusCodes.internalServerError).send(Messages.internalServerError)
    }
}

