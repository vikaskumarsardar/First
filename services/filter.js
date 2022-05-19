const {Messages} = require('../message/')

exports.filter = (req,file,cb) =>{
    if(file.mimetype == 'image/png' || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
        cb(null,true)
    }
    else{
        cb(null,false)
        return cb(new Error(Messages.ONLY_IMAGE_FILES))
    }
}