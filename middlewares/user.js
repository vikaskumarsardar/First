const jwt = require('jsonwebtoken')
exports.Verify = async(req,res,next) =>{
    try{

        const headers = req.headers['authorization']    
        const accessToken = headers && headers.split(' ')[1]
        const isVerified = jwt.verify(accessToken,process.env.SECRET)
        // if(!isVerified.isAdmin) return res.status(403).send("ACCESS FORBIDDEN")
        req.token = isVerified
        next()
    }catch(err){
        return res.status(401).send("Unauthorized Access")
    }
        
}