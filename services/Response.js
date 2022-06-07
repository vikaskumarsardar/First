const { Messages } = require("../message/");
const { statusCodes } = require("../statusCodes/");

exports.sendResponse = (req, res, Code ,message, data) => {
  try {
    Code = Code || statusCodes.OK;
    message = message || Messages.SUCCESS;
    data = data || {};
    return res
      .status(Code)
      .send({ statusCode: Code, message: message, data: data });
  } catch (err) {
    throw err;
  }
};

exports.sendErrorResponse = (req, res, Code, error) => {
  try {
    Code = Code || statusCodes.badRequest;
    error = error || Messages.BAD_REQUEST;
    return res.status(Code).send({
      statusCode: Code,
      error: error,
    });
  } catch (err) {
    throw err;
  }
};

exports.unAuthorizedResponse = (req, res, message) => {
  try {
    const Code = statusCodes.UnauthorizedAccess;
    message = message || Messages.UNAUTHORIZED_ACCESS;
    return res.status(Code).send({
      statusCode: Code,
      message: message,
      data: {},
    });
  } catch (err) {
    throw err;
  }
};

exports.AccessForbiddenResponse = (req, res, message) => {
  try {
    const Code = statusCodes.AccessForbidden;
    message = message || Messages.ACCESS_FORBIDDEN;
    return res.status(Code).send({
      statusCode: Code,
      message: message,
      data: {},
    });
  } catch (err) {
    throw err;
  }
};
