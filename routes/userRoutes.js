const express = require("express");
const Router = express.Router();
const User = require("../controllers");
const Multer = require("../services/");
const { VerifyUser } = require("../middlewares/");

Router.post("/register", User.userRegister);
Router.post("/login", User.userLogin);
Router.post("/activateDeactivate", VerifyUser, User.activateDeactivate);
Router.post(
  "/uploadOne",
  VerifyUser,
  Multer.UploadUserSingle,
  User.UploadUserImage
);
Router.post(
  "/uploadMany",
  VerifyUser,
  Multer.UploadUserMany,
  User.UploadMultipleUserImage
);
Router.post(
  "/uploadFields",
  VerifyUser,
  Multer.UploadUserFields,
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
Router.post("/updateUserProfile", VerifyUser, User.updateUserProfile);
Router.delete("/deleteAddress", VerifyUser, User.deleteUserAddress);


// DUMMY ROUTES
Router.get("/getAllDummyData", VerifyUser, User.getAllDummyData);

module.exports = Router;
