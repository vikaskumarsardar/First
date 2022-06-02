const express = require("express");
const path = require("path");
const { constants } = require("./constants/");
module.exports = (app) => {
  const views = path.join(__dirname, "views");
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.set("view engine", "ejs");
  app.set("views", views);
  app.use("/css", express.static(path.join(__dirname, constants.path.CSS)));
  app.use(
    constants.path.user,
    express.static(path.resolve(constants.path.userUploads))
  );
  app.use(
    constants.path.admin,
    express.static(path.join(__dirname, constants.path.adminUploads))
  );
  app.use(
    constants.path.merchant,
    express.static(path.join(__dirname, constants.path.merchantUploads))
  );
  app.use(
    constants.path.category,
    express.static(path.join(__dirname, constants.path.categoryUploads))
  );
  app.use(
    constants.path.subCategory,
    express.static(path.join(__dirname, constants.path.subCategoryUploads))
  );
  app.use(
    constants.path.product,
    express.static(path.join(__dirname, constants.path.productUploads))
  );
  app.use(
    constants.path.addOns,
    express.static(path.join(__dirname, constants.path.addOnsUploads))
  );
  require("./config/").connection;
  app.use("/api", require("./routes"));
};