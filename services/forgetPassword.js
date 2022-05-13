const nodeMailer = require('nodemailer')
const {v1 : uuidv1} = require('uuid')
const forgetPassword = async(email,_id) => {
  
    const host = email.split('@')[1]
    try{

        const emailString = uuidv1()
        let transporter = nodeMailer.createTransport({
            host: `smtp.${host}`,
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.EMAIL_PASSWORD
            },
        })
        
        await transporter.sendMail({
            from: `"SWAPAN" <${process.env.EMAIL}>`, 
            to: email,
            subject: "Reset your password", 
            html: `<div>
            <b>Please verify your email</b>
            <form action = "${process.env.USER_ROUTE}/forgetPassword" method="post" >
            <input name = "_id" style="display:none" value="${_id}"/>
            <button type = "submit">Verify Now</button>
            </div>`, 
           
        });
        return emailString;
    }
    catch(err){
        console.log(err);
    }

}

module.exports = forgetPassword