const { sendResponse, sendErrorResponse } = require("../services/");
const { statusCodes } = require("../statusCodes/");
const { Messages } = require("../message/");
const { constants } = require("../constants/");
const {
  merchantModel,
  categoryModel,
  subCategoryModel,
  productModel,
} = require("../models/");
const { generateJWTTOken } = require("../lib/");

exports.merchantLogin = async (req, res) => {
  try {
    const user = await merchantModel.findOne({ _id: req.body.email }).exec();

    if (!user)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    if (!user.isValid(req.body.password))
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );

    user.isActive = true;
    await user.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      `${Messages.welcome}${user.username}`,
      user
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

exports.addCategory = async (req, res) => {
  try {
    const newCategory = new categoryModel(req.body);
    newCategory.merchantId = req.token._id;
    const saved = await newCategory.save();
    sendResponse(req, res, statusCodes.created, Messages.SUCCESS, saved);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const acknowledged = await categoryModel
      .findOneAndUpdate(
        { merchantId: req.token._id, isDeleted: false },
        { isDeleted: true }
      )
      .exec();
    if (!acknowledged)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    const updateSubcategory = await subCategoryModel
      .findOneAndUpdate(
        { merchantId: req.token._id, isDeleted: false },
        { isDeleted: true }
      )
      .exec();
    if (!updateSubcategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    sendResponse(req, res, statusCodes.SUCCESS, Messages.deletedSuccessFully);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.activeDeactiveCategory = async (req, res) => {
  try {
    const acknowledged = await categoryModel.findOneAndUpdate(
      { merchantId: req.token._id, isDeleted: false },
      { isActive: req.body.activeDeactive },
      { new: true }
    );
    if (!acknowledged)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    const updateSubcategory = await subCategoryModel
      .findOneAndUpdate(
        { merchantId: req.token._id, isDeleted: false },
        { isActive: req.body.activeDeactive }
      )
      .exec();
    if (!updateSubcategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const activatedDeactivatedProduct = await productModel
      .findOneAndUpdate(
        { merchantId: req.token._id },
        { isActive: req.body.activeDeactive }
      )
      .lean()
      .exec();
    if (!activatedDeactivatedProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    sendResponse(
      req,
      res,
      statusCodes.OK,
      req.body.activeDeactive
        ? Messages.activatedSuccessfully
        : Messages.deletedSuccessFully
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

exports.updateCategory = async (req, res) => {
  try {
    const acknowledged = await categoryModel.findOneAndUpdate(
      { merchantId: req.token._id, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!acknowledged)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, acknowledged);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const categories = await categoryModel
      .find({ isDeleted: false, isActive: true })
      .lean()
      .exec();
    if (categories.length == 0)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, {
      categoriesCount: categories.length,
      categories,
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

exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryModel
      .findOne({ merchantId: req.params._id, isDeleted: false, isActive: true })
      .lean()
      .exec();
    if (!category)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, category);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.blockUnblockCategory = async (req, res) => {
  try {
    const blockedUnblockedCategory = await categoryModel.findOneAndUpdate(
      { merchantId: req.token._id, isDeleted: false },
      { isBLocked: req.body.isBlocked },
      { new: true }
    );
    if (!blockedUnblockedCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    const updateSubcategory = await subCategoryModel
      .findOneAndUpdate(
        { merchantId: req.token._id, isDeleted: false },
        { isBlocked: req.body.isBlocked }
      )
      .exec()
      .lean();
    if (!updateSubcategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const blockedUnblockedProduct = await productModel
      .findOneAndUpdate(
        { merchantId: req.token._id },
        { isActive: req.body.activeDeactive }
      )
      .lean()
      .exec();
    if (!blockedUnblockedProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );

    sendResponse(
      req,
      res,
      statusCodes.OK,
      req.body.isBlocked
        ? Messages.blockedSuccessfully
        : Messages.unblockedSuccessfully
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

exports.addSubCategory = async (req, res) => {
  try {
    const newSubCategory = new subCategoryModel(req.body);
    newSubCategory.merchantId = req.token._id;
    newSubCategory.categoryId = req.body.categoryId;
    const saved = await newCategory.save();
    sendResponse(req, res, statusCodes.created, Messages.SUCCESS, saved);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const acknowledged = await subCategoryModel
      .findOneAndUpdate(
        { merchantId: req.token._id, isDeleted: false },
        { isDeleted: true }
      )
      .exec();
    if (!acknowledged)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const deletedProduct = await productModel
      .findOneAndUpdate({ merchantId: req.token._id }, { isDeleted: true })
      .lean()
      .exec();
    if (!deletedProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    sendResponse(req, res, statusCodes.SUCCESS, Messages.deletedSuccessFully);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.activeDeactiveSubCategory = async (req, res) => {
  try {
    const acknowledged = await subCategoryModel.findOneAndUpdate(
      { merchantId: req.token._id, isDeleted: false },
      { isActive: req.body.activeDeactive },
      { new: true }
    );
    if (!acknowledged)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const activateDeactivateProduct = await productModel
      .findOneAndUpdate(
        { merchantId: req.token._id },
        { isActive: req.body.activeDeactive }
      )
      .lean()
      .exec();
    if (!activateDeactivateProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );

    sendResponse(
      req,
      res,
      statusCodes.OK,
      req.body.activeDeactive
        ? Messages.activatedSuccessfully
        : Messages.deletedSuccessFully
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

exports.updateSubCategory = async (req, res) => {
  try {
    const acknowledged = await categoryModel.findOneAndUpdate(
      { merchantId: req.token._id, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!acknowledged)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, acknowledged);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getAllSubCategory = async (req, res) => {
  try {
    const subCategories = await subCategoryModel
      .find({ isDeleted: false, isActive: true })
      .lean()
      .exec();
    if (subCategories.length == 0)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, {
      subCategoriesCount: categories.length,
      subCategories,
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

exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await subCategoryModel
      .findOne({ merchantId: req.params._id, isDeleted: false, isActive: true })
      .lean()
      .exec();
    if (!subCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, subCategory);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.blockUnblockSubCategory = async (req, res) => {
  try {
    const blockedUnblockedSubCategory = await subCategoryModel.findOneAndUpdate(
      { merchantId: req.token._id, isDeleted: false },
      { isBLocked: req.body.isBlocked },
      { new: true }
    );
    if (!blockedUnblockedSubCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const blockedUnblockedProduct = await productModel
      .findOneAndUpdate(
        { merchantId: req.token._id },
        { isBLocked: req.body.isBlocked }
      )
      .lean()
      .exec();
    if (!blockedUnblockedProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    sendResponse(
      req,
      res,
      statusCodes.OK,
      req.body.isBlocked
        ? Messages.blockedSuccessfully
        : Messages.unblockedSuccessfully
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

exports.addProduct = async (req, res) => {
  try {
    const newProduct = new productModel(req.body);
    newProduct.merchantId = req.token._id;
    newProduct.subCategoryId = req.body.subCategoryId;
    newProduct.categoryId = req.body.categoryId;
    const saved = await newProduct.save();
    sendResponse(req, res, statusCodes.created, Messages.SUCCESS, saved);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.deleteProductById = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );

    const deletedProduct = await productModel
      .findOneAndUpdate(
        { _id: req.params._id },
        { isDeleted: true },
        { new: true }
      )
      .lean()
      .exec();
    if (!deletedProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    sendResponse(req, res, statusCodes.created, Messages.SUCCESS, saved);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.updateProductById = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const updatedProduct = await productModel
      .findOneAndUpdate({ merchantId: req.params._id }, req.body, { new: true })
      .lean()
      .exec();
    if (!updatedProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, updatedProduct);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.uploadMerchantImage = async (req, res) => {
  try {
    const foundUser = await merchantModel.findOne({ _id: req.token._id });
    const files = `${constants.path.merchant}${req.file.path.split("\\")[2]}`;
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
