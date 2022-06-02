const Admin = require("./adminController");
const User = require("./userController");
const Merchant = require("./merchant");
const EJS = require("./EJS");
module.exports = {
  adminRegister: Admin.adminRegister,
  userRegister: User.userRegister,
  getAllCategories : Admin.getAllCategories,
  addMerchant: Admin.addMerchant,
  adminLogin: Admin.adminLogin,
  addMerchant: Admin.addMerchant,
  deleteMerchant: Admin.deleteMerchant,
  updateMerchantById: Admin.updateMerchantById,
  getAllMerchants: Admin.getAllMerchants,
  getMerchantById: Admin.getMerchantById,
  activeDeactivateMerchant: Admin.activeDeactivateMerchant,
  dummyData: Admin.Dummy,
  findUsers: Admin.getAllUsers,
  userLogin: User.userLogin,
  resendOTPForUser: User.resendOTP,
  activateDeactivate: User.activateDeactivate,
  blockUnblock: Admin.blockUnblockUser,
  deleteUser: Admin.deleteUser,
  activateDeactivateUser: Admin.activateDeactivateUser,
  UploadAdminOne: Admin.UploadOne,
  UploadAdminMany: Admin.UploadManyImages,
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
  getAllDummyData: User.DummyData,
  merchantLogin: Merchant.merchantLogin,
  addCategory: Merchant.addCategory,
  deleteCategory: Merchant.deleteCategory,
  recoverDeletedCategory: Merchant.recoverDeletedCategory,
  activeDeactiveCategory: Merchant.activeDeactiveCategory,
  updateCategory: Merchant.updateCategory,
  getAllCategory: Merchant.getAllCategory,
  getCategoryById: Merchant.getCategoryById,
  blockUnblockCategory: Merchant.blockUnblockCategory,
  addSubCategory: Merchant.addSubCategory,
  deleteSubCategory: Merchant.deleteSubCategory,
  activeDeactiveSubCategory: Merchant.activeDeactiveSubCategory,
  updateSubCategory: Merchant.updateSubCategory,
  getAllSubCategory: Merchant.getAllSubCategory,
  getSubCategoryById: Merchant.getSubCategoryById,
  blockUnblockSubCategory: Merchant.blockUnblockSubCategory,
  addProduct: Merchant.addProduct,
  deleteProductById: Merchant.deleteProductById,
  updateProductById: Merchant.updateProductById,
  getAllProducts : Merchant.getAllProducts,
  getProductById : Merchant.getProductById,
  uploadMerchantImage: Merchant.uploadMerchantImage,
  getProductsByIdSCID : Merchant.getProductsBySCID,
  addToCart : User.addToCart,
  addCharges : Merchant.addCharges,
  updateCharges : Merchant.updateCharges,
  removeItemsFromCart : User.removeItemsFromCart,
  getAllCart : User.getAllCart,
  getNearbyMerchants : User.getNearbyMerchants,
  addAddOns : Merchant.addAddOns,
  getAllProductsFromAllMerchants : User.getAllProductsFromAllMerchants,
};
