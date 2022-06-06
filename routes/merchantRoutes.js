const express = require("express");
const Router = express.Router();
const merchant = require("../controllers/");
const {VerifyMerchant,checkUploads} = require('../middlewares/')
const {uploadImage} = require('../services/')

// MERCHANT LOGIN ROUTES
Router.post("/login", merchant.merchantLogin);

// CATEGORY ROUTES
Router.post("/addCategory",VerifyMerchant,uploadImage('category','single'),merchant.addCategory);
Router.delete("/deleteCategory/:_id",VerifyMerchant, merchant.deleteCategory);
Router.get("/recoverDeletedCategory/:_id",VerifyMerchant, merchant.recoverDeletedCategory);
Router.post("/activeDeactiveCategory/:_id",VerifyMerchant, merchant.activeDeactiveCategory);
Router.put("/updateCategory/:_id",VerifyMerchant, merchant.updateCategory);
Router.get("/getAllCategory",VerifyMerchant, merchant.getAllCategory);
Router.get("/getCategoryById/:_id",VerifyMerchant, merchant.getCategoryById);
Router.post("/blockUnblockCategory",VerifyMerchant, merchant.blockUnblockCategory);

// SUBCATEGORY ROUTES
Router.post("/addSubCategory",VerifyMerchant,uploadImage('subcategory','single'), merchant.addSubCategory);
Router.delete("/deleteSubCategory/:_id",VerifyMerchant, merchant.deleteSubCategory);
Router.post("/activeDeactiveSubCategory/:_id",VerifyMerchant, merchant.activeDeactiveSubCategory);
Router.post("/updateSubCategory",VerifyMerchant, merchant.updateSubCategory);
Router.get("/getAllSubCategory/:_id",VerifyMerchant, merchant.getAllSubCategory);
Router.get("/getSubCategoryById/:_id",VerifyMerchant, merchant.getSubCategoryById);
Router.get("/blockUnblockSubCategory/:_id",VerifyMerchant, merchant.blockUnblockSubCategory);
Router.post("/uploadMerchantImage",VerifyMerchant,uploadImage('merchant','single'), merchant.uploadMerchantImage);

// PRODUCT ROUTES
Router.post("/addProduct",VerifyMerchant,uploadImage('product','single'),merchant.addProduct);
Router.get('/getAllProducts',merchant.getAllProducts);
Router.get('/getProductById/:_id',VerifyMerchant,merchant.getProductById);
Router.delete("/deleteProduct/:_id",VerifyMerchant, merchant.deleteProductById);
Router.put("/updateProduct/:_id",VerifyMerchant,merchant.updateProductById);
Router.get("/getProductsBySCID/:_id",VerifyMerchant,merchant.getProductsByIdSCID);

// CHARGE ROUTES
Router.post('/addCharges',VerifyMerchant,merchant.addCharges)
Router.post('/updateCharges',VerifyMerchant,merchant.updateCharges)

// ADDONS ROUTES
Router.post("/addAddOns",[VerifyMerchant,uploadImage('addons','single')],merchant.addAddOns);
Router.get("/getAddOnPage",merchant.getAddOnPage);

Router.get('/getAllAddOns',VerifyMerchant,merchant.getAllAddOns)

module.exports = Router;
