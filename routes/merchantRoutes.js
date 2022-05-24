const express = require("express");
const Router = express.Router();
const merchant = require("../controllers/");
const {VerifyMerchant} = require('../middlewares/')
const {uploadMerchantImage} = require('../services/')

// MERCHANT LOGIN ROUTES
Router.post("/login", merchant.merchantLogin);

// CATEGORY ROUTES
Router.post("/addCategory",VerifyMerchant, merchant.addCategory);
Router.delete("/deleteCategory/:_id",VerifyMerchant, merchant.deleteCategory);
Router.get("/recoverDeletedCategory/:_id",VerifyMerchant, merchant.recoverDeletedCategory);
Router.post("/activeDeactiveCategory/:_id",VerifyMerchant, merchant.activeDeactiveCategory);
Router.put("/updateCategory/:_id",VerifyMerchant, merchant.updateCategory);
Router.get("/getAllCategory",VerifyMerchant, merchant.getAllCategory);
Router.get("/getCategoryById/:_id",VerifyMerchant, merchant.getCategoryById);
Router.post("/blockUnblockCategory",VerifyMerchant, merchant.blockUnblockCategory);

// SUBCATEGORY ROUTES
Router.post("/addSubCategory",VerifyMerchant, merchant.addSubCategory);
Router.delete("/deleteSubCategory",VerifyMerchant, merchant.deleteSubCategory);
Router.post("/activeDeactiveSubCategory",VerifyMerchant, merchant.activeDeactiveSubCategory);
Router.post("/updateSubCategory",VerifyMerchant, merchant.updateSubCategory);
Router.get("/getAllSubCategory/:_id",VerifyMerchant, merchant.getAllSubCategory);
Router.get("/getSubCategoryById/:_id",VerifyMerchant, merchant.getSubCategoryById);
Router.get("/blockUnblockSubCategory/:_id",VerifyMerchant, merchant.blockUnblockSubCategory);
Router.post("/uploadMerchantImage",VerifyMerchant,uploadMerchantImage, merchant.uploadMerchantImage);

// PRODUCT ROUTES
Router.post("/addProduct",VerifyMerchant, merchant.addProduct);
Router.get('/getAllProducts',VerifyMerchant,merchant.getAllProducts);
Router.get('/getProductById/:_id',VerifyMerchant,merchant.getProductById);
Router.delete("/deleteProduct/:_id",VerifyMerchant, merchant.deleteProductById);
Router.put("/updateProduct/:_id",VerifyMerchant,merchant.updateProductById);
Router.get("/getProductsBySCID/:_id",VerifyMerchant,merchant.getProductsByIdSCID);

module.exports = Router;
