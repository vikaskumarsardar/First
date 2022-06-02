const multer = require("multer");
const { filter } = require("./filter");
const { constants } = require("../constants");
let storage
let uploadimages ;
const store = (dir,opt) => {
  storage = multer.diskStorage({
    destination: function (req, file, next) {
      next(null, `./uploads/${dir}`);
    },
    filename: function (req, file, next) {
      const uniqueName =
        constants.dateNow() + "-" + Math.round(Math.random() * 1e9);
      next(
        null,
        file.fieldname + "-" + uniqueName + "." + file.mimetype.split("/")[1]
      );
    },
  });
  
  uploadimages = multer({ storage: storage, fileFilter: filter });
  return opt == 'single' ? uploadimages.single("image") : opt == 'many' ? uploadimages.array("image", 4) : opt == 'uploadFields' ? uploadimages.fields([
    { name: "image", maxCount: 2 },
    { name: "files", maxCount: 2 },
  ]) : {} ;
};

module.exports = {
  uploads: store,
};
