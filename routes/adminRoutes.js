const express = require("express");
const Router = express.Router();
const { VerifyAdmin } = require("../middlewares");
const Admin = require("../controllers");
const {uploadImage} = require("../services/");

// ADMIN ROUTES
Router.post("/register", Admin.adminRegister);
Router.post("/login", Admin.adminLogin);
Router.post("/blockUnblock", VerifyAdmin, Admin.blockUnblock);
Router.delete("/deleteUser", VerifyAdmin, Admin.deleteUser);
Router.post(
  "/activateDeactivateUser",
  VerifyAdmin,
  Admin.activateDeactivateUser
);
Router.post(
  "/uploadOne",
  VerifyAdmin,
  uploadImage('admin','single'),
  Admin.UploadAdminOne
);
Router.post(
  "/uploadMany",
  VerifyAdmin,
  uploadImage('admin','many'),
  Admin.UploadAdminMany
);
Router.post(
  "/uploadFields",
  VerifyAdmin,
  uploadImage('admin','uploadFields'),
  Admin.UploadAdminFields
);

// USER ROUTES
Router.post("/insertMany", Admin.dummyData);
Router.get("/findUsers", VerifyAdmin, Admin.findUsers);
Router.get("/deleteMany", VerifyAdmin, Admin.deleteMany);
Router.get("/findUserById/:_id", VerifyAdmin, Admin.findUserById);

//  MERCHANT ROUTES
Router.post("/addMerchant", VerifyAdmin, Admin.addMerchant);
Router.post("/deleteMerchant/:_id", VerifyAdmin, Admin.deleteMerchant);
Router.put("/updateMerchantById/:_id", VerifyAdmin, Admin.updateMerchantById);
Router.get("/getAllMerchants", VerifyAdmin, Admin.getAllMerchants);
Router.get("/getMerchantById/:_id", VerifyAdmin, Admin.getMerchantById);
Router.post(
  "/activeDeactivateMerchant",
  VerifyAdmin,
  Admin.activeDeactivateMerchant
);

// CATEGOTY ROUTES
Router.get("/getAllCategories", VerifyAdmin, Admin.getAllCategories);

module.exports = Router;
