const Admin =  require('./adminController')
const User  = require('./userController')
const EJS = require('./EJS')
module.exports = {
    adminRegister : Admin.adminRegister,
    userRegister : User.userRegister,
    adminLogin : Admin.adminLogin,
    userLogin : User.userLogin,
    activateDeactivate : User.activateDeactivate,
    blockUnblock : Admin.blockUnblock,
    deleteUser : Admin.deleteUser,
    activateDeactivateUser : Admin.activateDeactivateUser,
    UploadAdminOne:Admin.UploadOne,
    UploadAdminMany:Admin.UploadMany,
    UploadAdminFields:Admin.UploadFields,
    UploadUserOne:User.UploadOne,
    UploadUserMany:User.UploadMany,
    UploadUserFields:User.UploadFields,
    OTP : EJS.OTP,
    VerifyUser : User.Verify,
    UserSignup:EJS.SignUP,
    UserLogin : EJS.Login,
    VerifyOTP:EJS.VerifyOTP

}