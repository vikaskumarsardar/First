const { sendResponse, sendErrorResponse } = require("../services/");
const { statusCodes } = require("../statusCodes/");
const { Messages } = require("../message/");
const { constants } = require("../constants/");
const {
  merchantModel,
  categoryModel,
  subCategoryModel,
  productModel,
  chargesModel,
  addOnsModel,
} = require("../models/");
const { generateJWTTOken, ObjectIsValid } = require("../lib/");

exports.merchantLogin = async (req, res) => {
  try {
    const merchant = await merchantModel
      .findOne(
        { email: req.body.email },
        {
          isDeleted: 0,
          isActive: 0,
          isBLocked: 0,
          isMerchant: 0,
          createdAt: 0,
          updatedAt: 0,
        }
      )
      .exec();

    if (!merchant)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.userNotFound
      );
    if (!merchant.isValid(req.body.password))
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.passwordIncorrect
      );
    const accessToken = await generateJWTTOken({
      _id: merchant._id,
    });
    merchant.accessToken = accessToken;

    merchant.isActive = true;
    await merchant.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      `${Messages.welcome}${merchant.firstname}`,
      merchant
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
    const foundCategory = await categoryModel
      .findOne({ name: req.body.name, merchantId: req.token._id })
      .lean()
      .exec();
    if (foundCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.CATEGORY_ALREADY_EXISTS
      );
    const newCategory = new categoryModel(req.body);
    newCategory.merchantId = req.token._id;
    const path = req?.file?.path || "\\\\";
    const files = `${constants.path.category}${path.split("\\")[2]}`;
    newCategory.image = files;
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.objectIdInvalid
      );
    const acknowledged = await categoryModel
      .findOneAndUpdate(
        { _id: req.params._id, isDeleted: false },
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
      .updateMany(
        { categoryId: acknowledged._id, isDeleted: false },
        { isDeleted: true }
      )
      .exec();

    if (updateSubcategory.modifiedCount === 0)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const deletedProduct = await productModel
      .updateMany({ categoryId: acknowledged._id }, { isDeleted: true })
      .lean()
      .exec();
    if (!deletedProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );

    sendResponse(req, res, statusCodes.OK, Messages.deletedSuccessFully);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};
exports.recoverDeletedCategory = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.objectIdInvalid
      );
    const acknowledged = await categoryModel
      .findOneAndUpdate(
        { _id: req.params._id, isDeleted: true },
        { isDeleted: false }
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
      .updateMany(
        { categoryId: acknowledged._id, isDeleted: true },
        { isDeleted: false }
      )
      .exec();
    if (updateSubcategory.modifiedCount === 0)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );

    const deletedProduct = await productModel
      .updateMany(
        { categoryId: acknowledged._id, isDeleted: true },
        { isDeleted: false }
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

    sendResponse(req, res, statusCodes.OK, Messages.SUCCESFULLY_RECOVERED);
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const acknowledged = await categoryModel
      .findOneAndUpdate(
        { _id: req.params._id, isDeleted: false },
        { isActive: req.body.activeDeactive },
        { new: true }
      )
      .lean()
      .exec();
    if (!acknowledged)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CATEGORY
      );
    const updateSubcategory = await subCategoryModel
      .updateMany(
        { categoryId: acknowledged._id, isDeleted: false },
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
      .updateMany(
        { categoryId: acknowledged._id, isDeleted: false },
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const acknowledged = await categoryModel.findOneAndUpdate(
      { _id: req.params._id, isDeleted: false },
      req.body,
      {
        new: true,
        projection: {
          isActive: 0,
          isBLocked: 0,
          isDeleted: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      }
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
    let id = req.token?._id || req.params._id;
    const categories = await categoryModel
      .find(
        { merchantId: id, isDeleted: false, isActive: true },
        {
          isActive: 0,
          isBLocked: 0,
          isDeleted: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        }
      )
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
    console.log(err);
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );

    const category = await categoryModel
      .findOne(
        { _id: req.params._id, isDeleted: false, isActive: true },
        {
          isActive: 0,
          isBLocked: 0,
          isDeleted: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        }
      )
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
    if (!ObjectIsValid(req.body._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const blockedUnblockedCategory = await categoryModel.findOneAndUpdate(
      { _id: req.body._id, isDeleted: false },
      { isBlocked: req.body.isBlocked },
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
      .updateMany(
        { categoryId: blockedUnblockedCategory._id, isDeleted: false },
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
      .updateMany(
        { categoryId: blockedUnblockedCategory._id },
        { isBlocked: req.body.isBlocked }
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
    const foundSubCategory = await subCategoryModel
      .findOne({ name: req.body.name, categoryId: req.body.categoryId })
      .lean()
      .exec();
    if (foundSubCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.SUBCATEGORY_ALREADY_EXISTS
      );
    const newSubCategory = new subCategoryModel(req.body);
    const path = req?.file?.path || "\\";
    const files = path.split("\\")[2]
      ? `${constants.path.subCategory}${path.split("\\")[2]}`
      : "";
    newSubCategory.image = files;
    newSubCategory.merchantId = req.token._id;
    newSubCategory.categoryId = req.body.categoryId;
    const saved = await newSubCategory.save();
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const deletedSubCategory = await subCategoryModel
      .findOneAndUpdate(
        { _id: req.params._id, isDeleted: false },
        { isDeleted: true }
      )
      .exec();
    if (!deletedSubCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const deletedProduct = await productModel
      .updateMany(
        { subCategoryId: deletedSubCategory._id, isDeleted: false },
        { isDeleted: true }
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
    sendResponse(req, res, statusCodes.OK, Messages.deletedSuccessFully);
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const acknowledged = await subCategoryModel.findOneAndUpdate(
      { _id: req.params._id, isDeleted: false },
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
      .updateMany(
        { subCategoryId: acknowledged._id },
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const acknowledged = await categoryModel.findOneAndUpdate(
      { _id: req.params._id, isDeleted: false },
      req.body,
      {
        new: true,
        projection: {
          isActive: 0,
          isBlocked: 0,
          isDeleted: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      }
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.objectIdInvalid
      );
    const subCategories = await subCategoryModel
      .find(
        { categoryId: req.params._id, isDeleted: false, isActive: true },
        {
          isActive: 0,
          isBlocked: 0,
          isDeleted: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        }
      )
      .lean()
      .exec();

    if (subCategories.length === 0)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, {
      subCategoriesCount: subCategories.length,
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
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const foundSubCategory = await subCategoryModel
      .findOne(
        { _id: req.params._id, isDeleted: false, isActive: true },
        {
          isActive: 0,
          isBlocked: 0,
          isDeleted: 0,
          __v: 0,
          merchantId: 0,
          categoryId: 0,
          createdAt: 0,
          updatedAt: 0,
        }
      )
      .lean()
      .exec();
    if (!foundSubCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, foundSubCategory);
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
    if (!ObjectIsValid(req.body._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const blockedUnblockedSubCategory = await subCategoryModel
      .findOneAndUpdate(
        { _id: req.body._id, isDeleted: false },
        { isBlocked: req.body.isBlocked },
        { new: true }
      )
      .exec();
    if (!blockedUnblockedSubCategory)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_SUB_CATEGORY
      );
    const blockedUnblockedProduct = await productModel
      .updateMany(
        { subCategoryId: blockedUnblockedSubCategory._id },
        { isBlocked: req.body.isBlocked }
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
    const foundProduct = await productModel.findOne({
      productName: req.body.productName,
      subCategoryId: req.body.subCategoryId,
      categoryId: req.body.categoryId,
    });
    if (foundProduct)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.PRODUCT_ALREADY_EXISTS
      );
    const newProduct = new productModel(req.body);
    const path = req?.file?.path || "\\";
    const files = path.split("\\")[2]
      ? `${constants.path.product}${path.split("\\")[2]}`
      : "";
    newProduct.image = files;
    newProduct.merchantId = req.token._id;
    newProduct.subCategoryId = req.body.subCategoryId;
    newProduct.categoryId = req.body.categoryId;
    const saved = await newProduct.save();
    sendResponse(req, res, statusCodes.created, Messages.SUCCESS, saved);
  } catch (err) {
    console.log(err);
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
        { _id: req.params._id, isDeleted: false },
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
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS);
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
      .findOneAndUpdate({ _id: req.params._id, isDeleted: false }, req.body, {
        new: true,
        projection: {
          isActive: 0,
          isBlocked: 0,
          isDeleted: 0,
          __v: 0,
          merchantId: 0,
          categoryId: 0,
          subCategoryId: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      })
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

exports.getAllProducts = async (req, res) => {
  try {
    const limit = parseInt(req.body.limit) || 10;
    const skip = Math.max(0, (parseInt(req.body.page) || 1) - 1) * limit;
    console.log(skip);
    const query = {
      // merchantId: req.token._id,
      $and: [
        {
          $or: [
            {
              productName: { $regex: req.body.search || "", $options: "$i" },
            },
            {
              brand: { $regex: req.body.search || "", $options: "$i" },
            },
            {
              description: { $regex: req.body.search || "", $options: "$i" },
            },
          ],
        },
        { isDeleted: false },
        { isActive: true },
      ],
    };
    const itemCount = await productModel.countDocuments(query);
    const pageCount = Math.ceil(itemCount / limit);
    const allProduts = await productModel
      .find(query, {
        isActive: 0,
        isBlocked: 0,
        isDeleted: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    const message =
      allProduts.length === 0 ? Messages.NO_PRODUCT_FOUND : Messages.SUCCESS;
    sendResponse(req, res, statusCodes.OK, message, {
      products: allProduts,
      pageCount,
      itemCount,
    });
  } catch (err) {
    sendErrorResponse(
      res,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};
exports.getProductById = async (req, res) => {
  try {
    const productFound = await productModel.find(
      {
        _id: req.params._id,
        isDeleted: false,
      },
      {
        isActive: 0,
        isBlocked: 0,
        isDeleted: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      }
    );
    if (!productFound)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, productFound);
  } catch (err) {
    sendErrorResponse(
      res,
      res,
      statusCodes.internalServerError,
      Messages.incorrectEmailString
    );
  }
};

exports.activeDeactiveProduct = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const activeDeactiveProduct = await productModel
      .findOneAndUpdate(
        { _id: req.params._id, isDeleted: false },
        { isActive: req.body.activeDeactive },
        {
          new: true,
          projection: {
            isActive: 0,
            isBlocked: 0,
            isDeleted: 0,
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
          },
        }
      )
      .lean()
      .exec();
    if (!activeDeactiveProduct)
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
      Messages.SUCCESS,
      activeDeactiveProduct
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

exports.getProductsBySCID = async (req, res) => {
  try {
    const foundProducts = await productModel
      .find(
        { subCategoryId: req.params._id, isDeleted: false },
        {
          isActive: 0,
          isBlocked: 0,
          isDeleted: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        }
      )
      .exec();
    if (foundProducts.length === 0)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, foundProducts);
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
    const foundUser = await merchantModel.findOne({
      _id: req.token._id,
      isDeleted: false,
    });
    const path = req.file.path || "\\";
    const files = path.split("\\")[2]
      ? `${constants.path.merchant}${path.split("\\")[2]}`
      : "";
    foundUser.image = files;
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

exports.addCharges = async (req, res) => {
  try {
    const foundMerchantCharges = await chargesModel
      .findOne({
        merchantId: req.token._id,
      })
      .lean()
      .exec();
    if (foundMerchantCharges)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.CHARGES_ALREADY_EXISTS
      );
    const newCharges = new chargesModel(req.body);
    newCharges.merchantId = req.token._id;
    newCharges.total =
      newCharges.tax +
      newCharges.deliveryCharges +
      newCharges.serviceCharges +
      newCharges.GST;
    const savedCharges = await newCharges.save();
    sendResponse(req, res, statusCodes.created, Messages.SUCCESS, savedCharges);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.updateCharges = async (req, res) => {
  try {
    const updatedCharges = await chargesModel
      .findOneAndUpdate({ merchantId: req.token._id }, req.body)
      .lean()
      .exec();
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, updatedCharges);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.addAddOns = async (req, res) => {
  try {
    const foundAddOns = await addOnsModel
      .findOne({ merchantId: req.token._id, item: req.body.item })
      .lean()
      .exec();
    if (foundAddOns)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.ADDONS_ALREADY_EXISTS
      );
    const newAddOns = new addOnsModel(req.body);
    newAddOns.merchantId = req.token._id;
    const path = req?.file?.path || "\\";
    const files = path.split("\\")[2]
      ? `${constants.path.addOns}${path.split("\\")[2]}`
      : "";
    newAddOns.image = files;
    const savedAddOn = await newAddOns.save();
    sendResponse(req, res, statusCodes.created, Messages.SUCCESS, savedAddOn);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getAddOnPage = async (req, res) => {
  try {
    res.render("addAddons");
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getAllAddOns = async (req, res) => {
  try {
    const foundAddOns = await addOnsModel
      .find({ merchantId: req.token._id })
      .lean()
      .exec();
    if (!foundAddOns)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_ADDONS_FOUND
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, {
      addOns: foundAddOns,
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
