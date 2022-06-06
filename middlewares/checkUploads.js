const { Messages } = require("../message");
const { sendResponse, sendErrorResponse } = require("../services");
const { statusCodes } = require("../statusCodes");
const { addOnsModel } = require("../models/");
exports.checkUploads = async (req, res, next) => {
  try {
    const foundAddOns = await addOnsModel
      .findOne({ merchantId: req.body.token, item: req.body.item })
      .lean()
      .exec();

      console.log(req.body,"body>>>>>>>>>>");
    if(foundAddOns){
      return sendResponse(
        req,
        res,
        statusCodes.badRequest,
        Messages.ADDONS_ALREADY_EXISTS
      )
    };
      console.log("paar ho gya hai");
    next();
  } catch (err) {
    console.log(err);
    return sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};
