const Admin = require("./adminController");
const User = require("./userController");
const EJS = require("./EJS");
module.exports = {
  adminRegister: Admin.adminRegister,
  userRegister: User.userRegister,
  adminLogin: Admin.adminLogin,
  dummyData: Admin.Dummy,
  findUsers: Admin.getAllUsers,
  userLogin: User.userLogin,
  resendOTPForUser: User.resendOTP,
  activateDeactivate: User.activateDeactivate,
  blockUnblock: Admin.blockUnblock,
  deleteUser: Admin.deleteUser,
  activateDeactivateUser: Admin.activateDeactivateUser,
  UploadAdminOne: Admin.UploadOne,
  UploadAdminMany: Admin.UploadMany,
  UploadAdminFields: Admin.UploadFields,
  UploadUserImage: User.UploadUserImage,
  UploadMultipleUserImage: User.UploadMultipleUserImage,
  UploadUserFields: User.UploadFields,
  forgetPassword: User.forgetPassword,
  ResetPassword: User.ResetPassword,
  changePassword: User.changePassword,
  addUserAddress: User.addAddress,
  getUserAddressById: User.getAddressById,
  updateUserAddress: User.updateAddress,
  deleteUserAddress: User.deleteAddress,
  updateUserProfile: User.updateProfile,
  findUserById: Admin.findUserById,
  OTP: EJS.OTP,
  VerifyUser: User.Verify,
  UserSignup: EJS.SignUP,
  UserLogin: EJS.Login,
  VerifyOTP: EJS.VerifyOTP,
  deleteMany: Admin.deleteMany,
  getAllDummyData : User.DummyData,
};
