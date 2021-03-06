const express = require('express')
const Router = express.Router()
const Routes =  require("./routes/");

Router.use("/user", Routes.UserRoutes);
Router.use("/admin", Routes.AdminRoutes);
Router.use("/merchant", Routes.merchantRoutes);
Router.use('/',Routes.EJS)
module.exports = Router