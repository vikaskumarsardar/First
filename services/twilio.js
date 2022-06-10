const twilio = require("twilio");
const { Messages } = require("../message/");
const { statusCodes } = require("../statusCodes/");
const { sendErrorResponse } = require("../services/");
const config = require('config')


const twilioService = async (route, countryCode, phone) => {
  try {
    const sixDigitNum = Math.round(Math.random() * 1e6);
    let body;
    body =
      route === "verifyPhone"
        ? `${Messages.OTP} ${sixDigitNum}`
        : route === "forgetPassword"
        ? `${Messages.RESET_OTP} ${sixDigitNum}`
        : route === "resendOTPForVerification"
        ? `${Messages.RESEND_OTP} ${sixDigitNum}`
        : Messages.DEFAULT_BODY;

    const client = twilio(config.get("twilioOptions.ACCOUNT_SID"), config.get("twilioOptions.AUTH_TOKEN"));
    const clientMessage = await client.messages.create({
      to: `${countryCode}${phone}`,
      from: config.get("twilioOptions.TWILIO_NUMBER"),
      body: body,
    });
    return sixDigitNum;
  } catch (err) {
    return sendErrorResponse(
      req,
      res,
      statusCodes.internalServerError,
      Messages.internalServerError
    );
  }
};

module.exports = twilioService;
