const {adminModel} = require('../modals')
exports.adminRegister = async(req,res) =>{
    try{
        const doesExist  = await adminModel.find({$or:[{username:req.body.username},{email:req.body.email}]})
        if(doesExist.length > 0) return res.status(400).json({message:"User with same email or username already exists"})
        const newUser = new adminModel(req.body)
        const accesstoken = await jwt.sign({_id:newUser._id,username:newUser.username},process.env.SECRET)
        newUser.accessToken = accesstoken
        console.log("kjhkjhkjh",newUser);
        // const savedUser = await newUser.save()
        // if(!savedUser){
            // await savedUser.save()
            // res.status(201).json({message:"Admin succesfully registered ",accesstoken:accesstoken,data:savedUser})
        // }
            
    }catch(err){
        res.status(500).send("Internal Server Error")
    }
    
}