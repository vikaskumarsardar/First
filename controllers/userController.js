const {
  UserModel,
  AdminModel,
  userAddressModel,
  dummyModel,
  cartModel,
  productModel,
  chargesModel,
  merchantModel,
  addOnsModel,
  orderModel,
} = require("../models");
const jwt = require("jsonwebtoken");
const { twilio, nodeMailer } = require("../services/");
const { Messages } = require("../message/");
const { statusCodes } = require("../statusCodes/");
const { sendResponse, sendErrorResponse } = require("../services/");
const { constants } = require("../constants/");
const { ObjectIsValid, generateJWTTOken } = require("../lib");
const message = require("../message/message");

exports.userRegister = async (req, res) => {
  try {
    const doesExist = await UserModel.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.email },
        { phone: req.body.phone },
      ],
    });
    if (doesExist)
      return res
        .status(statusCodes.badRequest)
        .json({ message: Messages.alreadyExists });
    const newUser = new UserModel(req.body);
    const accesstoken = await generateJWTTOken({ _id: newUser._id });
    newUser.accessToken = accesstoken;
    req.body.verifyMethod = Messages.email;

    if (req.body.verifyMethod == Messages.phone) {
      const OTP = await twilio(
        Messages.verfyPhone,
        req.body.countryCode,
        req.body.phone
      );
      newUser.OTP = OTP;
      newUser.verifyMethod = Messages.phone;
    } else if (req.body.verifyMethod == Messages.email) {
      const info = await nodeMailer(Messages.verifyEmail, req.body.email);
      newUser.emailOTP = info;
      newUser.verifyMethod = Messages.email;
    }

    const path = req?.file?.path || "\\";
    const file = path.split("\\")[2]
      ? `${constants.path.user}${path.split("\\")[2]}`
      : "";
    newUser.image = file;
    const savedUser = await newUser.save();
    sendResponse(
      req,
      res,
      statusCodes.created,
      Messages.registeredSuccessfully,
      {
        username: savedUser.username,
        firstname: savedUser.firstname,
        lastname: savedUser.lastname,
        email: savedUser.email,
        image: savedUser.image,
        phone: `${savedUser.countryCode}${savedUser.phone}`,
      }
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
exports.userLogin = async (req, res) => {
  try {
    const doesExist = await UserModel.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username },
        {
          $and: [
            { phone: req.body.username },
            { countryCode: req.body.countryCode },
          ],
        },
      ],
    });

    if (!doesExist || doesExist.isDeleted) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.userNotFound
      );
    }
    if (!doesExist.isValid(req.body.password)) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.passwordIncorrect
      );
    }
    if (
      (doesExist.verifyMethod == Messages.email &&
        !doesExist.isEmailVerified) ||
      (doesExist.verifyMethod == Messages.phone && !doesExist.isPhoneVerified)
    ) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.accountNotVerified
      );
    }

    if (doesExist.isBlocked) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.UnauthorizedAccess,
        Messages.blockedByAdmin
      );
    }
    const accesstoken = await generateJWTTOken({ _id: doesExist._id });

    doesExist.accessToken = accesstoken;
    const savedUser = await doesExist.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      `${Messages.welcome} ${savedUser.username} `,
      { accessToken: savedUser.accessToken }
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
exports.updateProfile = async (req, res) => {
  try {
    const path = req.file?.path || "\\";
    const file = path.split("\\")[2]
      ? `${constants.path.user}${path.split("\\")[2]}`
      : "";
    req.body.image = file;
    const updateProfile = await UserModel.findOneAndUpdate(
      { _id: req.token._id },
      req.body,
      {
        new: true,
        projection: {
          isActive: 0,
          isDeleted: 0,
          isBlocked: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      }
    )
      .lean()
      .exec();
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, updateProfile);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};
exports.activateDeactivate = async (req, res) => {
  try {
    const updated = await UserModel.findOneAndUpdate(
      { _id: req.params._id },
      { isActive: req.body.isActive },
      { new: true }
    );
    sendResponse(
      req,
      res,
      statusCodes.OK,
      updated.isActive
        ? Messages.activatedSuccessfully
        : Messages.deactivatedSuccessfully,
      updated.username
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

exports.UploadUserImage = async (req, res) => {
  try {
    const foundUser = await UserModel.findOne({ _id: req.token._id });
    const path = req.file?.path || "\\";
    const files = path.split("\\")[2]
      ? `${constants.path.user}${path.split("\\")[2]}`
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
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};
exports.UploadMultipleUserImage = async (req, res) => {
  try {
    const foundUser = await UserModel.findOne({ _id: req.token._id });
    const imageArr = req.files.map((resp) => {
      return `${constants.path.user}${resp.path.split("\\")[2]}`;
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
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};
exports.UploadFields = async (req, res) => {
  try {
    const arr = Array.from(req.files);
    sendResponse(
      req,
      res,
      statusCodes.OK,
      Messages.uploadedImageFieldSuccessfully
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
exports.Verify = async (req, res) => {
  try {
    const userFound = await UserModel.findOne({
      $or: [
        {
          $and: [
            { phone: req.body.phone },
            { countryCode: req.body.countryCode },
          ],
        },
        { email: req.body.email },
        { emailOTP: req.params.user },
      ],
    });
    if (!userFound) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.userNotFound
      );
    }
    if (userFound.verifyMethod == Messages.email) {
      if (userFound.emailOTP !== req.params.user) {
        return sendErrorResponse(
          req,
          res,
          statusCodes.badRequest,
          Messages.invalidOTP
        );
      }
      userFound.isEmailVerified = true;
    } else if (userFound.verifyMethod == Messages.phone) {
      if (userFound.OTP !== req.body.OTP) {
        return sendErrorResponse(
          req,
          res,
          statusCodes.badRequest,
          Messages.invalidOTP
        );
      }
      userFound.isPhoneVerified = true;
    }
    const saved = await userFound.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      `${constants.MR} ${saved.firstname} ${Messages.verifiedSuceessfully}`
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

exports.resendOTP = async (req, res) => {
  try {
    const userFound = await UserModel.findOne({
      $or: [
        {
          $and: [
            { phone: req.body.phone },
            { countryCode: req.body.countryCode },
          ],
        },
        { email: req.body.email },
      ],
    });
    if (!userFound) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.userNotFound
      );
    }
    if (userFound.verifyMethod == Messages.phone) {
      const OTP = await twilio(
        Messages.resendOTP,
        req.body.countryCode,
        req.body.phone
      );
      userFound.OTP = OTP;
    } else if (userFound.verifyMethod == Messages.email) {
      const info = await nodeMailer(Messages.resendOTP, req.body.email);
      userFound.emailOTP = info;
    }
    const saved = await userFound.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      `${constants.MR} ${saved.firstname} ${Messages.CHECK_YOUR_OTP} ${userFound.verifyMethod}`
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

exports.forgetPassword = async (req, res) => {
  try {
    const userFound = await UserModel.findOne({
      $or: [
        { email: req.body.username },
        { username: req.body.username },
        {
          $and: [
            { phone: req.body.username },
            { countryCode: req.body.countryCode },
          ],
        },
      ],
    });
    if (!userFound)
      return res.status(statusCodes.badRequest).send(Messages.userNotFound);
    if (
      !userFound.isEmailVerified &&
      userFound.verifyMethod === Messages.email
    ) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.emailNotVerified
      );
    }
    if (
      userFound.verifyMethod == Messages.phone &&
      !userFound.isPhoneVerified
    ) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.phoneNotVerified
      );
    }
    if (userFound.verifyMethod == Messages.email && userFound.isEmailVerified) {
      const resetToken = await nodeMailer(
        Messages.forgetPassword,
        userFound.email
      );
      userFound.resetToken = resetToken;
      userFound.expireTokenIn = constants.dateNow() + 600000;
    }
    if (userFound.verifyMethod == Messages.phone && userFound.isPhoneVerified) {
      const resetToken = await twilio(
        Messages.forgetPassword,
        userFound.countryCode,
        userFound.phone
      );
      userFound.resetToken = resetToken;
      userFound.expireTokenIn = constants.dateNow() + 600000;
    }
    await userFound.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      `${Messages.CheckYour} ${userFound.verifyMethod}`
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

exports.ResetPassword = async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.passwordAndNewPasswordNotSame
      );

    const userFound = await UserModel.findOne({
      resetToken: req.params.token,
      expireTokenIn: { $gt: constants.dateNow() },
    });
    if (!userFound) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.tokenExpired
      );
    }
    userFound.expireTokenIn = null;
    if (!userFound.resetPassword(req.body.password)) {
      return sendErrorResponse(
        req,
        res,
        statusCodes.internalServerError,
        Messages.somethingWentWrong
      );
    }
    await userFound.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      Messages.passwordChangedSuccessfully
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

exports.changePassword = async (req, res) => {
  try {
    const userFound = await UserModel.findOne({
      $or: [
        { email: req.body.username },
        { username: req.body.username },
        {
          $and: [
            { countryCode: req.body.countryCode },
            { phone: req.body.username },
          ],
        },
      ],
    });
    if (!userFound)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.userNotFound
      );
    if (!userFound.isValid(req.body.password))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.passwordIncorrect
      );
    if (!userFound.resetPassword(req.body.newPassword))
      return sendErrorResponse(
        req,
        res,
        statusCodes.internalServerError,
        Messages.somethingWentWrong
      );
    await userFound.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      Messages.passwordChangedSuccessfully
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

exports.addAddress = async (req, res) => {
  try {
    const newAddress = new userAddressModel(req.body);
    newAddress.UserId = req.token._id;
    const savedData = await newAddress.save();
    sendResponse(req, res, statusCodes.created, Messages.SUCCESS, savedData);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getAddressById = async (req, res) => {
  try {
    if (!ObjectIsValid(req.params._id))
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.BAD_REQUEST
      );
    const address = await userAddressModel
      .findOne({ UserId: req.params._id, isDeleted: false })
      .lean()
      .exec();
    if (!address)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_ADDRESS_FOUND
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, address);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await userAddressModel
      .findOneAndUpdate({ UserId: req.token._id, isDeleted: false }, req.body, {
        new: true,
      })
      .lean()
      .exec();
    if (!address)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_ADDRESS_FOUND
      );
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, address);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const deletedData = await userAddressModel
      .findOneAndUpdate(
        { UserId: req.token._id, isDeleted: false },
        { isDeleted: true }
      )
      .lean()
      .exec();
    if (!deletedData)
      return sendErrorResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_ADDRESS_FOUND
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
exports.addToCart = async (req, res) => {
  try {
    const productFound = await productModel
      .findOne({ _id: req.body.productId })
      .lean()
      .exec();
    if (!productFound)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    const addOnsFound = await addOnsModel
      .find({ _id: { $in: req.body.addOnId } })
      .lean()
      .exec();
    let addOnsTotal = 0;
    const addOnsArr =
      addOnsFound.length > 0
        ? addOnsFound.map((result) => {
            addOnsTotal += result.price;
            return {
              _id: result._id,
              item: result.item,
              price: result.price,
            };
          })
        : [];

    const itemPresentInCart = await cartModel
      .findOne({ userId: req.token._id, isPlaced: false })
      .exec();

    const totalCharges = await chargesModel
      .findOne({
        merchantId: productFound.merchantId,
      })
      .lean()
      .exec();

    const cartItems = itemPresentInCart ?? new cartModel();
    const quantity = Math.max(parseInt(req.body.quantity), 1) || 1;
    cartItems.items =
      cartItems.items.findIndex((resp) => resp._id == req.body.productId) > -1
        ? cartItems.items.map((resp) => {
            if (resp._id == req.body.productId) {
              return {
                ...resp,
                subTotal:
                  (resp.price + addOnsTotal) *
                  (req.body.quantity || resp.quantity + 1),
                addOns: addOnsArr,
                quantity: req.body.quantity || parseInt(resp.quantity) + 1,
              };
            }
            return resp;
          })
        : [
            ...cartItems.items,
            {
              _id: productFound._id,
              price: productFound.price,
              quantity: quantity,
              addOns: addOnsArr,
              image: productFound.image,
              subTotal: (productFound.price + addOnsTotal) * quantity,
              deliveryCharges: totalCharges.total,
            },
          ];

    cartItems.total = cartItems.items.reduce(
      (a, b) => a + b.subTotal + b.deliveryCharges,
      0
    );
    cartItems.userId = req.token._id;
    cartItems.chargeId = totalCharges._id;
    const savedCart = await cartItems.save();

    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, savedCart);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.removeItemsFromCart = async (req, res) => {
  try {
    const productFound = await productModel
      .findOne({ _id: req.params._id })
      .lean()
      .exec();
    const itemInCart = await cartModel
      .findOne({ userId: req.token._id, isPlaced: false })
      .exec();

    if (!itemInCart)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CART_FOUND
      );

    const extraCharges = await chargesModel
      .findOne({ _id: itemInCart.chargeId })
      .lean()
      .exec();

    const index = itemInCart.items.findIndex(
      (items) => items._id == req.params._id
    );

    if (index > -1) {
      const totalAddOns = itemInCart.items[index].addOns.reduce(
        (a, b) => a + b.price,
        0
      );
      itemInCart.items[index].quantity == 1
        ? (itemInCart.items.splice(index, 1),
          (itemInCart.total -= extraCharges.total))
        : (itemInCart.items[index] = {
            ...itemInCart.items[index],
            subTotal:
              itemInCart.items[index].subTotal -
              (productFound.price + totalAddOns),
            quantity: itemInCart.items[index].quantity - 1,
          });
      itemInCart.total -= productFound.price + totalAddOns;
    } else
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.ITEM_NOT_FOUND_IN_CART
      );
    const removedItemFromCart = await itemInCart.save();
    sendResponse(
      req,
      res,
      statusCodes.OK,
      Messages.SUCCESS,
      removedItemFromCart
    );
  } catch (err) {
    sendResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.getAllCart = async (req, res) => {
  try {
    const foundCartItems = await cartModel
      .findOne(
        { userId: req.token._id, isPlaced: false },
        { items: 1, _id: 0, total: 1 }
      )
      .lean()
      .exec();
    if (!foundCartItems)
      return sendResponse(req, res, statusCodes.OK, Messages.NO_CART_FOUND, {
        results: {
          items: [],
          total: 0,
        },
      });
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, {
      results: foundCartItems,
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
exports.DummyData = async (req, res) => {
  try {
    const itemCounts = await dummyModel.countDocuments().lean().exec();
    const dummyDatas = await dummyModel.find().lean().exec();
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, {
      results: dummyDatas,
      itemCounts,
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

exports.getNearbyMerchants = async (req, res) => {
  try {
    let { location, limit, pageNo } = req.body;
    limit = limit || 10;
    skip = Math.max(parseInt(pageNo || 1) - 1, 0) * limit;

    const query = { isBLocked: false, isActive: true, isDeleted: false };
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: location,
        },
        $minDistance: 0,
        $maxDistance: 1000,
      },
    };
    const nearbyMerchants = await merchantModel
      .find(query, {
        isBLocked: 0,
        isActive: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
    if (!nearbyMerchants)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.MERCHANT_NOT_FOUND
      );

    const itemCount = nearbyMerchants.length;
    const pageCount = Math.ceil(itemCount / limit);
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, {
      nearbyMerchants,
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

exports.getAllProductsFromAllMerchants = async (req, res) => {
  try {
    const limit = parseInt(req.body.limit) || 10;
    const skip = Math.max(0, (parseInt(req.body.page) || 1) - 1) * limit;
    const search = req.body.search || "";
    const query = {
      $and: [
        {
          $or: [
            {
              productName: { $regex: search, $options: "$i" },
            },
            // {
            //   brand: { $regex: search, $options: "$i" },
            // },
            // {
            //   description: { $regex: search, $options: "$i" },
            // },
          ],
        },
        { isDeleted: false },
        { isActive: true },
      ],
    };
    const itemCount = await productModel.countDocuments(query);
    const pageCount = Math.ceil(itemCount / limit);
    const foundProducts = await productModel
      .find(query, {
        isActive: 0,
        isDeleted: 0,
        isBlocked: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    if (!foundProducts)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    const message =
      foundProducts.length === 0 ? Messages.NO_PRODUCT_FOUND : Messages.SUCCESS;

    sendResponse(req, res, statusCodes.OK, message, {
      products: foundProducts,
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

exports.getProductById = async (req, res) => {
  try {
    const foundProducts = await productModel
      .find({ _id: req.params._id })
      .lean()
      .exec();
    if (!foundProducts)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_PRODUCT_FOUND
      );
    const foundAddOns = await addOnsModel
      .find({ merchantId: foundProducts._id, isDeleted: false })
      .lean()
      .exec();
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, {
      products: foundProducts,
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
exports.getAllAddOnsByMerchantId = async (req, res) => {
  try {
    const foundAddOns = await addOnsModel
      .find({ merchantId: req.params._id, isDeleted: false })
      .lean()
      .exec();
    if (!foundAddOns)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_ADDONS_FOUND
      );
    sendResponse(req, res, statusCodes.SUCCESS, Messages.SUCCESS, foundAddOns);
  } catch (err) {
    sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

exports.placeOrders = async (req, res) => {
  try {
    const foundCart = await cartModel
      .findOne({ userId: req.token._id, isPlaced: false })
      .exec();
    if (!foundCart)
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.NO_CART_FOUND
      );
    const newOrder = new orderModel({
      items: foundCart.items,
      total: foundCart.total,
      userId: foundCart.userID,
    });
    newOrder.userID = req.token._id;
    foundCart.isPlaced = true;
    await foundCart.save();
    const savedOrder = await newOrder.save();
    sendResponse(
      req,
      res,
      statusCodes.created,
      Messages.SUCCESFULLY_PLACED_ORDER,
      savedOrder
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

exports.clearCart = async (req, res) => {
  try {
    const cartDeleted = await cartModel
      .findOneAndUpdate(
        { userID: req.token._id, isPlaced: false },
        { items: [], total: 0 },
        { new: true }
      )
      .lean()
      .exec();
    return cartDeleted
      ? sendResponse(
          req,
          res,
          statusCodes.OK,
          Messages.CLEARED_CART_SUCCESSFULLY,
          cartDeleted
        )
      : sendErrorResponse(
          req,
          res,
          statusCodes.badRequest,
          Messages.NO_CART_FOUND
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

exports.placedOrders = async (req, res) => {
  try {
    const foundOrders = await orderModel
      .find({ userID: req.token._id, isDelivered: false, isCanceled: false })
      .lean()
      .exec();
    if (!foundOrders)
      return sendResponse(req, res, statusCodes.OK, Messages.NO_ORDER_FOUND);
    sendResponse(req, res, statusCodes.OK, Messages.SUCCESS, foundOrders);
  } catch (err) {
    sendErrorResponse(req, res,statusCodes.internalServerError,Messages.internalServerError);
  }
};
