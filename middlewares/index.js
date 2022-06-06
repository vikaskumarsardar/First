const Admin = require('./admin')
const User = require('./user')
const merchant = require('./merchant')
const Upload = require('./upload')
const {checkUploads} = require('./checkUploads')
module.exports = {
    VerifyAdmin : Admin.Verify,
    VerifyUser : User.Verify,
    Upload : Upload.uploadOne,
    VerifyMerchant : merchant.Verify,
    checkUploads : checkUploads,
}