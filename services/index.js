const adminMulter = require('./adminMulter')
const userMulter = require('./userMulter')
const twilioService = require('./twilio') 

module.exports = {
    UploadAdminSingle : adminMulter.UploadOne, 
    UploadAdminMany : adminMulter.uploadMany, 
    UploadAdminFields : adminMulter.uploadFields, 
    UploadUserSingle : userMulter.UploadOne, 
    UploadUserMany : userMulter.uploadMany, 
    UploadUserFields : userMulter.uploadFields, 
    twilio : twilioService
}