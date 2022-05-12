const twilio = require('twilio')
const twilioService = async(countryCode)=>{
    try{
        const sixDigitNum = Math.round(Math.random() * 1E6)
        const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
        const clientMessage = await client.messages.create({
            to: `${countryCode.body.countryCode}${countryCode.body.phone}`,
            from: process.env.TWILIO_NUMBER,
            body: `Your OTP for Expandimo is ${sixDigitNum}`,
        })
        // console.log(clientMessage);
        return sixDigitNum;
    }
    catch(err){
        console.log("error hai");

    }
}

module.exports = twilioService

    