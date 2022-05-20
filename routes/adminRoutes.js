const express = require("express");
const Router = express.Router();
const { VerifyAdmin } = require("../middlewares");
const Admin = require("../controllers");
const Multer = require("../services/");

Router.post("/register", Admin.adminRegister);
Router.post("/login", Admin.adminLogin);
Router.post("/blockUnblock", VerifyAdmin, Admin.blockUnblock);
Router.post("/deleteUser", VerifyAdmin, Admin.deleteUser);
Router.post(
  "/activateDeactivateUser",
  VerifyAdmin,
  Admin.activateDeactivateUser
);
Router.post(
  "/uploadOne",
  VerifyAdmin,
  Multer.UploadAdminSingle,
  Admin.UploadAdminOne
);
Router.post(
  "/uploadMany",
  VerifyAdmin,
  Multer.UploadAdminMany,
  Admin.UploadAdminMany
);
Router.post(
  "/uploadFields",
  VerifyAdmin,
  Multer.UploadAdminFields,
  Admin.UploadAdminFields
);

// ADMIN ROUTES
Router.post("/insertMany", Admin.dummyData);
Router.get("/findUsers", VerifyAdmin, Admin.findUsers);
Router.get("/deleteMany", VerifyAdmin, Admin.deleteMany);
Router.get("/findUserById/:_id", VerifyAdmin, Admin.findUserById);

//  MERCHANT ROUTES
Router.post("/addMerchant", VerifyAdmin, Admin.addMerchant);
Router.post("/deleteMerchant", VerifyAdmin, Admin.deleteMerchant);
Router.put("/updateMerchantById", VerifyAdmin, Admin.updateMerchantById);
Router.get("/getAllMerchants", VerifyAdmin, Admin.getAllMerchants);
Router.get("/getMerchantById", VerifyAdmin, Admin.getMerchantById);
Router.post(
  "/activeDeactivateMerchant",
  VerifyAdmin,
  Admin.activeDeactivateMerchant
);

module.exports = Router;
