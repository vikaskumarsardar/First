const jwt = require("jsonwebtoken");
const { Messages } = require("../message/");
const { statusCodes } = require("../statusCodes/");
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
    if (!isVerified.isAdmin) return sendAccessForbidden(req, res);
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
