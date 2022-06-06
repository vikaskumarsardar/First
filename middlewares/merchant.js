const jwt = require("jsonwebtoken");
const { Messages } = require("../message/");
const { statusCodes } = require("../statusCodes/");
const {merchantModel} = require('../models/')
const {
  sendErrorResponse,
  sendUnauthorizedResponse,
  sendAccessForbidden,
} = require("../services/");
exports.Verify = async (req, res, next) => {
  try {
    const headers = req.headers["authorization"];
    const accessToken = headers && headers.split(" ")[1];
    const isVerified = jwt.verify(accessToken, process.env.SECRET);
    const verifiedMerchant = await merchantModel.findOne({_id : isVerified._id,accessToken : accessToken,isMerchant : true}).lean().exec()
    if(!verifiedMerchant) return sendAccessForbidden(req,res) 
    req.token = isVerified;
    next();
  } catch (err) {
    return sendErrorResponse(
      req,
      res,
      statusCodes.UnauthorizedAccess,
      Messages.UNAUTHORIZED_ACCESS
    );
  }
};
