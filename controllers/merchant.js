const {sendResponse,sendErrorResponse} = require('../services/')
const {statusCodes} = require('../statusCodes/')
const {Messages} = require('../message/')
const {merchantModel} = require('../models/')


exports.createCategory = async(req,res) =>{
                try{
                                const user = await merchantModel.findOne({_id : req.body.email}).exec()
                                if(!user) return sendErrorResponse(req,res,statusCodes.badRequest,Messages.BAD_REQUEST)
                                if(!user.isValid(req.body.password)) return sendResponse(req,res,statusCodes.badRequest,Messages.BAD_REQUEST) 
                                
                }
                catch(err){
                                sendErrorResponse(req,res,statusCodes.internalServerError,Messages.internalServerError)
                }
}