exports.OTP = async(req,res,next) =>{
    res.render('otp')
}
exports.SignUP = async(req,res,next) =>{
    res.render('signup')
}
exports.Login = async(req,res,next) =>{
    res.render('login')
}
exports.VerifyOTP = async(req,res,next) =>{
    res.render('verify')
}