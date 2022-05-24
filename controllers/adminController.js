const {
  AdminModel,
  UserModel,
  dummyModel,
  userAddressModel,
  merchantModel,
  categoryModel,
  subCategoryModel,
  productModel,
} = require("../models");
const { statusCodes } = require("../statusCodes/");
const { Messages } = require("../message/");
const { sendResponse, sendErrorResponse, nodeMailer } = require("../services/");
const jwt = require("jsonwebtoken");
const path = require("path");
const { constants } = require("../constants/");
const { ObjectIsValid, generateJWTTOken } = require("../lib");
exports.adminRegister = async (req, res) => {
  try {
    const doesExist = await AdminModel.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    });
    if (doesExist)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.alreadyExists
      );
    const newUser = new AdminModel(req.body);
    const accesstoken = await generateJWTTOken({
      _id: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    });
    newUser.accessToken = accesstoken;
    const savedUser = await newUser.save();
    sendResponse(
      req,
      res,
      statusCodes.created,
      Messages.registeredSuccessfully,
      savedUser
    );
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const doesUserExist = await AdminModel.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    });
    if (!doesUserExist)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.userNotFound
      );

    if (!doesUserExist.isValid(req.body.password))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.userNotFound
      );

    const accesstoken = await generateJWTTOken({
      _id: doesUserExist._id,
      username: doesUserExist.username,
      isAdmin: doesUserExist.isAdmin,
    });

    doesUserExist.accessToken = accesstoken;
    const saved = await doesUserExist.save();

    sendResponse(
      req,
      res,
      statusCodes.OK,
      `${Messages.welcome} ${saved.username}`,
      { oldToken: doesUserExist.accessToken, newToken: saved.accessToken }
    );
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.blockUnblockUser = async (req, res) => {
  try {
    const isUpdated = await UserModel.findOneAndUpdate(
      { _id: req.body._id },
      { isBlocked: req.body.isBlocked },
      { new: true }
    );

    sendResponse(
      req,
      res,
      statusCodes.OK,
      isUpdated.isBlocked
        ? `${isUpdated.username} ${Messages.blockedSuccessfully}`
        : `${isUpdated.username} ${Messages.unblockedSuccessfully}`
    );
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const isUpdated = await UserModel.findOneAndUpdate(
      { _id: req.body._id },
      { isDeleted: true },
      { new: true }
    );
    if (!isUpdated)
      return sendErrorResponse(
        req,
        res,
        statusCodes.internalServerError,
        Messages.internalServerError
      );
    sendResponse(
      req,
      res,
      statusCodes.OK,
      Messages.deletedSuccessfully,
      isUpdated.username
    );
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.activateDeactivateUser = async (req, res) => {
  try {
    const isUpdated = await UserModel.findOneAndUpdate(
      { _id: req.body._id },
      { isActive: req.body.isActive },
      { new: true }
    );

    sendResponse(
      req,
      res,
      statusCodes.OK,
      isUpdated.isActive
        ? `${isUpdated.username} ${Messages.active}`
        : `${isUpdated.username} ${Messages.deactivatedSuccessfully}`
    );
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.UploadOne = async (req, res) => {
  try {
    const foundUser = await AdminModel.findOne({ _id: req.token._id });
    const files = `${constants.path.admin}${req.file.path.split("\\")[2]}`;
    foundUser.image.push(files);
    const saved = await foundUser.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      Messages.uploadOneImageSuccessfully,
      files
    );
  } catch (err) {
    sendErrorResponse(
      res,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.UploadManyImages = async (req, res) => {
  try {
    const foundUser = await AdminModel.findOne({ _id: req.token._id });
    const imageArr = req.files.map((resp) => {
      return `${constants.path.admin}${resp.path.split("\\")[2]}`;
    });

    foundUser.image = [...foundUser.image, ...imageArr];
    await foundUser.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      Messages.uploadedManyImagesSuccessfully,
      imageArr
    );
  } catch (err) {
    sendErrorResponse(
      res,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.UploadFields = async (req, res) => {
  try {
    sendResponse(
      req,
      res,
      statusCodes.OK,
      Messages.uploadedImageFieldSuccessfully,
      req.files
    );
  } catch (err) {
    sendErrorResponse(
      res,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let { pageNo, limit, search, sort, filterKey } = req.query;
    filterKey =
      filterKey === "isPhoneVerified"
        ? { isPhoneVerified: true }
        : filterKey === "isEmailVerified"
        ? { isEmailVerified: true }
        : filterKey === "isBlocked"
        ? { isBlocked: true }
        : filterKey === "isActive"
        ? { isActive: true }
        : filterKey === "isDeleted"
        ? { isDeleted: true }
        : {};

    search = search || "";
    sort = sort || 1;
    limit = limit || constants.limit;
    pageNo = !pageNo || pageNo < 1 ? 1 : pageNo;
    const skipData = (pageNo - 1) * limit;
    const query = {};
    const OR = {
      $or: [
        { email: { $regex: search, $options: "$i" } },
        { firstname: { $regex: `^${search}`, $options: "$i" } },
        { username: { $regex: `^${search}`, $options: "$i" } },
      ],
    };

    query.$and = [OR, filterKey];

    const itemCount = await UserModel.countDocuments(query);
    const pageCount = Math.ceil(itemCount / limit);

    const results = await UserModel.find(query)
      .sort({ username: sort })
      .skip(skipData)
      .limit(limit)
      .lean()
      .exec();

    sendResponse(req, res, statusCodes.OK, Messages.FETCHED_SUCCESSFULLY, {
      results,
      pageCount,
      itemCount,
    });
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.Dummy = async (req, res) => {
  try {
    const datas = await dummyModel.insertMany(req.body.data);
    sendResponse(
      req,
      res,
      statusCodes.created,
      Messages.successfullyInsertedDatas,
      datas
    );
  } catch (err) {
    sendErrorResponse(
      res,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.deleteMany = async (req, res) => {
  try {
    await dummyModel.deleteMany();
    sendResponse(req, res, statusCodes.OK, Messages.deletedSuccessFully);
  } catch (err) {
    sendErrorResponse(
      res,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.findUserById = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const User = await UserModel.findOne({ _id: req.params._id }).lean().exec();
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, User);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.addMerchant = async (req, res) => {
  try {
    const newMerchant = new merchantModel({
      email: req.body.email,
      phone: req.body.phone,
      firstname: req.body.firstname,
      adminId: req.token._id,
      countryCode : req.body.countryCode
    });
    const admin = await AdminModel.findOne({ _id: req.token._id });
    admin.merchantId.push(newMerchant._id);
    await admin.save();
    const password = `${req.body.firstname}${req.body.phone}`;
    newMerchant.password = password;
    newMerchant.adminId = admin._id
    const savedMerchant = await newMerchant.save();
    await nodeMailer(Messages.ACCOUNT_CREDENTIAL, req.body.email, password);
    sendResponse(
      req,
      res,
      statusCodes.created,
      Messages.SUCCESS,
      savedMerchant
    );
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.deleteMerchant = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );

    const acknowledge = await merchantModel
      .findOneAndUpdate({ _id: req.params._id,isDeleted : false }, { isDeleted: true })
      .exec();
    if (!acknowledge)
      return sendErrorResponse(req, res, statusCodes.OK, Messages.userNotFound);
    const categories = await categoryModel
      .updateMany({ merchantId: req.params._id,isDeleted : false }, { isDeleted: true })
      .exec();
    if (!categories)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    const SubCategories = await subCategoryModel
      .updateMany({ merchantId: req.params._id,isDeleted : false }, { isDeleted: true })
      .exec();
    if (!SubCategories)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const products = await productModel
      .updateMany({ merchantId: req.params._id,isDeleted : false }, { isDeleted: true })
      .exec();
    if (!products)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    sendResponse(req, res, statusCodes.SUCCESS, Messages.SUCCESS);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.updateMerchantById = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );

    const updatedMerchant = await merchantModel.findOneAndUpdate(
      { _id: req.params._id },
      req.body,
      { new: true }
    );
    if (!updatedMerchant)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.MERCHANT_NOT_FOUND
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, updatedMerchant);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getAllMerchants = async (req, res) => {
  try {
    const merchants = await merchantModel.find({}).lean().exec();
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, merchants);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getMerchantById = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const merchant = await merchantModel
      .findOne({ _id: req.params._id })
      .lean()
      .exec();
      if(!merchant) return sendErrorResponse(req,res,statusCodes.badRequest,Messages.MERCHANT_NOT_FOUND)
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, merchant);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.activeDeactivateMerchant = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );

    const activateDeactivateMerchant = await merchantModel
      .findOneAndUpdate(
        { _id: req.params._id,isDeleted : false },
        { isActive: req.body.activateDeactivate },
        { new: true }
      )
      .exec()
      .lean();
    if (!activateDeactivateMerchant)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.MERCHANT_NOT_FOUND
      );
    const updatedCategory = await categoryModel
      .updateMany(
        { merchantId: req.params._id ,isDeleted : false},
        { isActive: req.body.activateDeactivate },
        { new: true }
      )
      .exec()
      .lean();
    if (!updatedCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    const updatedSubCategory = await subCategoryModel
      .updateMany(
        { merchantId: req.params._id ,isDeleted : false},
        { isActive: req.body.activateDeactivate },
        { new: true }
      )
      .exec()
      .lean();
    if (!updatedSubCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );

      const updatedProduct = await productModel.updateMany({merchantId : req.params._id,isDeleted : false},{isActive : req.body.activateDeactivate })
      if(!updatedProduct) return sendErrorResponse(req,res,statusCodes.badRequest,Messages.NO_PRODUCT_FOUND)
    sendResponse(
      req,
      res,
      statusCodes.OK,
      req.body.activateDeactivate
        ? Messages.activatedSuccessfully
        : Messages.deactivatedSuccessfully
    );
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};



exports.getAllCategories = async(req,res) =>{
  try{
    const categories = await categoryModel.aggregate([
      {
        $lookup : {
          from : "Merchant",
          localField : "merchantId",
          foreignField : "_id",
          as :"merchant_details"
        }
      }
    ]).exec()
    if(categories.length === 0) return sendErrorResponse(req,res,statusCodes.badRequest,Messages.NO_CATEGORY)
    sendResponse(req,res,statusCodes.OK,Messages.SUCCESS,categories)
    sendResponse(req,res,statusCodes.OK,Messages.SUCCESS,categories)
    
    

  }
  catch(err){
    sendErrorResponse(req,res,statusCodes.internalServerError,Messages.internalServerError)
  }
}
