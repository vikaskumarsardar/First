const { UserModel, AdminModel, userAddressModel,dummyModel } = require("../models");
const jwt = require("jsonwebtoken");
const { twilio, nodeMailer, response, error, send } = require("../services/");
const { Messages } = require("../message/");
const { statusCodes } = require("../statusCodes/");
const { sendResponse, sendErrorResponse } = require("../services/");
const {constants} = require("../constants/");
const { ObjectIsValid, generateJWTTOken } = require("../lib");

exports.userRegister = async (req, res, next) => {
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
exports.updateProfile = async (req, res) => {
  try {
    const updateProfile = await UserModel.findOneAndUpdate(
      { _id: req.token._id },
      req.body,
      { new: true }
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
    const files = `${constants.path.user}${req.file.path.split("\\")[2]}`;
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
    console.log(err);
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
      return sendResponse(req, res, statusCodes.badRequest, Messages.NO_ADDRESS_FOUND);
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


exports.DummyData = async(req,res) =>{
  try{
    const itemCounts = await dummyModel.countDocuments().lean().exec()
    const dummyDatas = await dummyModel.find().lean().exec()
    sendResponse(req,res,statusCodes.OK,Messages.SUCCESS,{results : dummyDatas,itemCounts})
  }
  catch(err){
    sendErrorResponse(req,res,statusCodes.internalServerError,Messages.internalServerError)
  }
}