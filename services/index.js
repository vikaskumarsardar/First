const merchant = require('./multer')
const twilioService = require('./twilio') 
const response = require('./Response')

module.exports = {
    twilio : twilioService,
    nodeMailer : require('./sendMail'),
    sendResponse : response.sendResponse,
    sendErrorResponse : response.sendErrorResponse,
    sendUnauthorizedResponse : response.unAuthorizedResponse,
     sendAccessForbidden : response.AccessForbiddenResponse ,
     uploadImage : merchant.uploads,
}