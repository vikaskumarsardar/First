const adminMulter = require('./adminMulter')
const userMulter = require('./userMulter')
const twilioService = require('./twilio') 
const response = require('./Response')

module.exports = {
    UploadAdminSingle : adminMulter.UploadOne, 
    UploadAdminMany : adminMulter.uploadMany, 
    UploadAdminFields : adminMulter.uploadFields, 
    UploadUserSingle : userMulter.UploadOne, 
    UploadUserMany : userMulter.uploadMany, 
    UploadUserFields : userMulter.uploadFields, 
    twilio : twilioService,
    nodeMailer : require('./sendMail'),
    sendResponse : response.sendResponse,
    sendErrorResponse : response.sendErrorResponse,
}