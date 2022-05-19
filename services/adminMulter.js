const multer = require("multer");
const { filter } = require("./filter");
const { constants } = require("../constants");
const storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, "./uploads/admin");
  },
  filename: function (req, file, next) {
    const uniqueName = constants.dateNow() + "-" + Math.round(Math.random() * 1e9);
    next(
      null,
      file.fieldname + "-" + uniqueName + "." + file.mimetype.split("/")[1]
    );
  },
});

const uploadAdmin = multer({ storage: storage, fileFilter: filter });

module.exports = {
  UploadOne: uploadAdmin.single("image"),
  uploadMany: uploadAdmin.array("image", 4),
  uploadFields: uploadAdmin.fields([
    { name: "image", maxCount: 2 },
    { name: "files", maxCount: 2 },
  ]),
};
