const {Messages} = require('../message/')
const {statusCodes} = require('../statusCodes/')

exports.sendResponse = (req,res,message,Code,data) =>{
                Code = Code || statusCodes.OK
                message = message || Messages.SUCCESS
                data = {}
                return res.status(Code).send({statusCode : Code,message : message  ,data : data})             
}



exports.sendErrorResponse = (req,res,error,Code) =>{
                Code = Code || statusCodes.badRequest
                error = error || Messages.BAD_REQUEST
                return res.status(Code).send({
                                statusCode : Code,
                                error : error,
                })             
}
