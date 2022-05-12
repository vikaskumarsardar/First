const multer = require('multer')
const {filter} = require('./filter')
const storage = multer.diskStorage({
    destination:function(req,file,next){
        next(null,"./uploads/admin")
    },
    filename:function(req,file,next){
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9)
        next(null,file.fieldname + '-' + uniqueName + '.' + file.mimetype.split('/')[1])
    }
})


const uploadAdmin = multer({storage:storage,fileFilter:filter})
// const uploadAdmin = multer({storage:storage,fileFilter})

module.exports = {
    UploadOne : uploadAdmin.single('image'),
    uploadMany : uploadAdmin.array('image',4),
    uploadFields : uploadAdmin.fields([{name:'image',maxCount:2},{name:'files',maxCount:2}])
}