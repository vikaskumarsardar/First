const nodeMailer = require("nodemailer");
const { v1: uuidv1 } = require("uuid");
const mailerService = async (route, email) => {
  const host = email.split("@")[1];
  try {
    const emailString = uuidv1();
    let transporter = nodeMailer.createTransport({
      host: `smtp.${host}`,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
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
                    <a style="text-decoration:none;color:#fff;font-size:15px;"href="http://localhost:5000/api/user/forgetPassword/${emailString}">Reset your password</a></div>
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
                    <a style="text-decoration:none;color:#fff;font-size:15px;"href="http://localhost:5000/api/user/verifyUser/${emailString}">Activate Your Account</a></div>
                    <br><br>
                    <p style="text-align:left;color:#000; font-size: 14px;">    
                    <h4>    Thanks,</h4>
                    <h4>Cart Team</h4>
                    </p>`;
    }
    if (route === "resendOTPForVerification") {
      subject = "Verify Your Email This is another link";
      html = `<h1 style="text-align:left; color:#00b9ee;">Welcome To Shopping Cart</h1>
                    <div></div>
                    <br><p style="text-align:left;color:#000; font-size:20px;">
                    <b>Hello, there!</b></p>
                    <p style="text-align:left;color:#000;font-size: 14px;">
                    <b>Thanks for creating a shopping cart account. To continue please confirm your
                    email address by clicking the button below.</b> </p>
                    <br><div style="display:inline-block;background:#00b9ee; padding:10px;-webkit-border-radius: 10px; -moz-border-radius: 4px; border-radius: 4px;">
                    <a style="text-decoration:none;color:#fff;font-size:15px;"href="http://localhost:5000/api/user/verifyUser/${emailString}">Activate Your Account</a></div>
                    <br><br>
                    <p style="text-align:left;color:#000; font-size: 14px;">    
                    <h4>    Thanks,</h4>
                    <h4>Cart Team</h4>
                    </p>`;
    }

    await transporter.sendMail({
      from: `"${process.env.COMPANY}" <${process.env.EMAIL}>`,
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
