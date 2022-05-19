const multer = require('multer')
const {filter} = require('./filter')
const {constants} = require('../constants')

const storage = multer.diskStorage({
    destination : function(req,file,next){
        next(null,"./uploads/users")
    },
    filename : function(req,file,next){
        const uniqueSuffix = constants.dateNow() + "-" + Math.round(Math.random() * 1E9)
        next(null,file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1])
    }
})

const uploadUser = multer({storage:storage,fileFilter:filter})

module.exports = {
    UploadOne : uploadUser.single('image'),
    uploadMany : uploadUser.array('image',4),
    uploadFields : uploadUser.fields([{name:'image',maxCount:2},{name:'files',maxCount:2}]),
    uploadNone : uploadUser.none(),
}