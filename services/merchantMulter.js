const multer = require("multer");
const { filter } = require("./filter");
const { constants } = require("../constants");
const storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, "./uploads/merchant");
  },
  filename: function (req, file, next) {
    const uniqueName = constants.dateNow() + "-" + Math.round(Math.random() * 1e9);
    next(
      null,
      file.fieldname + "-" + uniqueName + "." + file.mimetype.split("/")[1]
    );
  },
});

const uploadMerchant = multer({ storage: storage, fileFilter: filter });

module.exports = {
  uploadMerchantImage: uploadMerchant.single("image"),
  uploadMany: uploadMerchant.array("image", 4),
  uploadFields: uploadMerchant.fields([
    { name: "image", maxCount: 2 },
    { name: "files", maxCount: 2 },
  ]),
};
