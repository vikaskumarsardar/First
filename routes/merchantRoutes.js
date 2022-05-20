const express = require("express");
const Router = express.Router();
const merchant = require("../controllers/");
const {VerifyMerchant} = require('../middlewares/')
const {uploadMerchantImage} = require('../services/')

// MERCHANT LOGIN ROUTES
Router.post("/merchantLogin", merchant.merchantLogin);

// CATEGORY ROUTES
Router.post("/addCategory",VerifyMerchant, merchant.addCategory);
Router.delete("/deleteCategory",VerifyMerchant, merchant.deleteCategory);
Router.post("/activeDeactiveCategory",VerifyMerchant, merchant.activeDeactiveCategory);
Router.post("/updateCategory",VerifyMerchant, merchant.updateCategory);
Router.get("/getAllCategory",VerifyMerchant, merchant.getAllCategory);
Router.get("/getCategoryById",VerifyMerchant, merchant.getCategoryById);
Router.post("/blockUnblockCategory",VerifyMerchant, merchant.blockUnblockCategory);

// SUBCATEGORY ROUTES
Router.post("/addSubCategory",VerifyMerchant, merchant.addSubCategory);
Router.post("/deleteSubCategory",VerifyMerchant, merchant.deleteSubCategory);
Router.post("/activeDeactiveSubCategory",VerifyMerchant, merchant.activeDeactiveSubCategory);
Router.post("/updateSubCategory",VerifyMerchant, merchant.updateSubCategory);
Router.get("/getAllSubCategory",VerifyMerchant, merchant.getAllSubCategory);
Router.get("/getSubCategoryById",VerifyMerchant, merchant.getSubCategoryById);
Router.get("/blockUnblockSubCategory",VerifyMerchant, merchant.blockUnblockSubCategory);

// PRODUCT ROUTES
Router.get("/addProduct",VerifyMerchant, merchant.addProduct);
Router.delete("/deleteProductById",VerifyMerchant, merchant.deleteProductById);
Router.put("/updateProductById",VerifyMerchant,merchant.updateProductById);
Router.post("/uploadMerchantImage",VerifyMerchant,uploadMerchantImage, merchant.uploadMerchantImage);

module.exports = Router;
