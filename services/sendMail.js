const nodeMailer = require("nodemailer");
const { v1: uuidv1 } = require("uuid");
const config = require('config')
const mailerService = async (route, email,password = "") => {
  const host = email.split("@")[1];
  try {
    const emailString = uuidv1();
    let transporter = nodeMailer.createTransport({
      host: `smtp.${host}`,
      port: 465,
      secure: true,
      auth: {
        user: config.get("emailOptions.EMAIL"),
        pass: config.get("emailOptions.EMAIL_PASS"),
      },
    });

    let subject;
    let html;
    if (route === "forgetPassword") {
      subject = "Reset Password";
      html = `<h1 style="text-align:left; color:#00b9ee;">Reset your password</h1>
                    <div></div>
                    <br><p style="text-align:left;color:#000; font-size:20px;">
                    <b>Hello, there!</b></p>
                    <p style="text-align:left;color:#000;font-size: 14px;">
                    <b>To reset password please click the link below.</b> </p>
                    <br><div style="display:inline-block;background:#00b9ee; padding:10px;-webkit-border-radius: 10px; -moz-border-radius: 4px; border-radius: 4px;">
                    <a style="text-decoration:none;color:#fff;font-size:15px;"href="${config.get("USER_ROUTE_AWS")}/forgetPassword/${emailString}">Reset your password</a></div>
                    <br><br>
                    <p style="text-align:left;color:#000; font-size: 14px;">
                    <h4>Thanks,</h4>
                    <h4>Cart Team</h4>
                    </p>`;
    } else if (route === "verifyEmail") {
      subject = "Verify Your Email";
      html = `<h1 style="text-align:left; color:#00b9ee;">Welcome To Shopping Cart</h1>
                    <div></div>
                    <br><p style="text-align:left;color:#000; font-size:20px;">
                    <b>Hello, there!</b></p>
                    <p style="text-align:left;color:#000;font-size: 14px;">
                    <b>Thanks for creating a shopping cart account. To continue please confirm your
                    email address by clicking the button below.</b> </p>
                    <br><div style="display:inline-block;background:#00b9ee; padding:10px;-webkit-border-radius: 10px; -moz-border-radius: 4px; border-radius: 4px;">
                    <a style="text-decoration:none;color:#fff;font-size:15px;"href="${config.get("USER_ROUTE_AWS")}/verifyUser/${emailString}">Activate Your Account</a></div>
                    <br><br>
                    <p style="text-align:left;color:#000; font-size: 14px;">    
                    <h4>    Thanks,</h4>
                    <h4>Cart Team</h4>
                    </p>`;
    }
    else if (route === "resendOTPForVerification") {
      subject = "Verify Your Email This is another link";
      html = `<h1 style="text-align:left; color:#00b9ee;">Welcome To Shopping Cart</h1>
                    <div></div>
                    <br><p style="text-align:left;color:#000; font-size:20px;">
                    <b>Hello, there!</b></p>
                    <p style="text-align:left;color:#000;font-size: 14px;">
                    <b>Thanks for creating a shopping cart account. To continue please confirm your
                    email address by clicking the button below.</b> </p>
                    <br><div style="display:inline-block;background:#00b9ee; padding:10px;-webkit-border-radius: 10px; -moz-border-radius: 4px; border-radius: 4px;">
                    <a style="text-decoration:none;color:#fff;font-size:15px;"href="${config.get("USER_ROUTE_AWS")}/verifyUser/${emailString}">Activate Your Account</a></div>
                    <br><br>
                    <p style="text-align:left;color:#000; font-size: 14px;">    
                    <h4>    Thanks,</h4>
                    <h4>Cart Team</h4>
                    </p>`;
    }
    else if(route === "sendCredential"){
      subject = "Credentials for Food App"
      html = `
      <h1 style="text-align:left; color:#00b9ee;">Welcome To Food App</h1>
                    <div></div>
                    <br><p style="text-align:left;color:#000; font-size:20px;">
                    <b>Hello, there!</b></p>
                    <p style="text-align:left;color:#000;font-size: 14px;">
                    <b>Thanks for creating a Food App account. Here are your Credentials regarding the same .</b> </p>
                    <br><div style="display:inline-block;background:#00b9ee; padding:10px;-webkit-border-radius: 10px; -moz-border-radius: 4px; border-radius: 4px;">
                      <h4>  
                      email : ${email}
                      </h4>
                      <h4>  
                      password : ${password}
                      </h4>
                    <br><br>
                    <p style="text-align:left;color:#000; font-size: 14px;">    
                    <h4>    Thanks,</h4>
                    <h4>Food App Team</h4>
                    </p>
      
      `
    }

    await transporter.sendMail({
      from: `"${config.get("COMPANY")}" <${config.get("emailOptions.EMAIL")}>`,
      to: email,
      subject: subject,
      html: html,
    });
    return emailString;
  } catch (err) {
    console.log(err);
  }
};

module.exports = mailerService;
