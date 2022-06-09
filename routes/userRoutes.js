const express = require("express");
const Router = express.Router();
const User = require("../controllers");
const {uploadImage} = require("../services/");
const { VerifyUser, VerifyMerchant } = require("../middlewares/");

Router.post("/register", User.userRegister);
Router.post("/login", User.userLogin);
Router.post("/activateDeactivate", VerifyUser, User.activateDeactivate);
Router.post(
  "/uploadOne",
  VerifyUser,
  uploadImage('users','single'),
  User.UploadUserImage
);
Router.post(
  "/uploadMany",
  VerifyUser,
  uploadImage('users','many'),
  User.UploadMultipleUserImage
);
Router.post(
  "/uploadFields",
  VerifyUser,
  uploadImage('users','uploadFields'),
  User.UploadUserFields
);

// USER ROUTES
Router.get("/verifyUser/:user", User.VerifyUser);
Router.post("/forgetPassword", User.forgetPassword);
Router.post("/resetPassword/:token", User.ResetPassword);
Router.post("/changePassword", VerifyUser, User.changePassword);
Router.get("/signup", User.UserSignup);
Router.get("/login", User.UserLogin);
Router.get("/verify", User.OTP);
Router.post("/resendOTP", User.resendOTPForUser);
Router.post("/addAddress", VerifyUser, User.addUserAddress);
Router.get("/getAddressById/:_id", VerifyUser, User.getUserAddressById);
Router.put("/updateAddress", VerifyUser, User.updateUserAddress);
Router.post("/updateUserProfile", VerifyUser,uploadImage('users','single'),User.updateUserProfile);
Router.delete("/deleteAddress", VerifyUser, User.deleteUserAddress);

// DUMMY ROUTES
Router.get("/getAllDummyData", VerifyUser, User.getAllDummyData);
Router.get("/getAllCategory/:_id", User.getAllCategory);
Router.get("/getAllProducts",VerifyUser,User.getAllProductsFromAllMerchants)

// CART ROUTES
Router.post("/addToCart", VerifyUser, User.addToCart);
Router.delete(
  "/removeItemsFromCart/:_id",
  VerifyUser,
  User.removeItemsFromCart
);
Router.get("/getAllCarts", VerifyUser, User.getAllCart);

// ORDER ROUTES
Router.get("/getAllMerchants", User.getAllMerchants);
Router.get("/getNearbyMerchants", VerifyUser, User.getNearbyMerchants);
Router.get('/getAllAddOns/:_id',VerifyUser,User.getAllAddOnsByMerchantId)
module.exports = Router;