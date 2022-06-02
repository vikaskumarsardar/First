const jwt = require('jsonwebtoken')
const {Messages} = require('../message/')
const {statusCodes} = require('../statusCodes/')
const {sendUnauthorizedResponse} = require('../services/')
const {UserModel} = require('../models/')
exports.Verify = async(req,res,next) =>{
    try{

        const headers = req.headers['authorization']    
        const accessToken = headers && headers.split(' ')[1]
        const isVerified = jwt.verify(accessToken,process.env.SECRET)
        const verifiedUser = await UserModel.findOne({_id : isVerified._id,accessToken : accessToken}).lean().exec()
        if(!verifiedUser) return sendAccessForbidden(req,res)
        req.token = isVerified
        next()
    }catch(err){
        return sendUnauthorizedResponse(req,res)
    }
}