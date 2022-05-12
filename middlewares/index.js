const Admin = require('./admin')
const User = require('./user')
const Upload = require('./upload')
module.exports = {
    VerifyAdmin : Admin.Verify,
    VerifyUser : User.Verify,
    Upload : Upload.uploadOne
}