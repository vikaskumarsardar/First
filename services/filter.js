exports.filter = (req,file,cb) =>{
    if(file.mimetype == 'image/png' || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
        cb(null,true)
    }
    else{
        cb(null,false)
        return cb(new Error('Only .jpg .png or .jpeg format allowed'))
    }

}