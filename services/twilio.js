const twilio = require('twilio')
const twilioService = async(route,countryCode,phone)=>{
    try{
        const sixDigitNum = Math.round(Math.random() * 1E6)
        let body;
        switch(route){
            case "verifyPhone":
                body = `Your OTP for Expandimo is ${sixDigitNum}`
            case "resetPassword" : 
                body = `<a href = "http://localhost:5000/api/user/forgetPassword/${sixDigitNum}">`    
            default :    
        }
        
        
        
        const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
        const clientMessage = await client.messages.create({
            to: `${countryCode}${phone}`,
            from: process.env.TWILIO_NUMBER,
            body: body,
        })
        return sixDigitNum;
    }
    catch(err){
        console.log(err);

    }
}

module.exports = twilioService

    