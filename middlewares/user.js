const jwt = require('jsonwebtoken')
const {Messages} = require('../message/')
const {statusCodes} = require('../statusCodes/')
const {sendUnauthorizedResponse} = require('../services/')
exports.Verify = async(req,res,next) =>{
    try{

        const headers = req.headers['authorization']    
        const accessToken = headers && headers.split(' ')[1]
        const isVerified = jwt.verify(accessToken,process.env.SECRET)
        req.token = isVerified
        next()
    }catch(err){
        return sendUnauthorizedResponse(req,res)
    }
        
}