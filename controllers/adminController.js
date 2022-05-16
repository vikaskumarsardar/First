const { AdminModel, UserModel, dummyModel } = require("../models");
const { statusCodes } = require("../statusCodes/");
const { Messages } = require("../message/");
const {sendResponse,sendErrorResponse} = require('../services/')
const jwt = require("jsonwebtoken");
const path = require("path");

exports.adminRegister = async (req, res) => {
  try {
    const doesExist = await AdminModel.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    });
    // if(doesExist.length > 0) return res.status(400).json({message:"User with same email or username already exists"})
    if (doesExist)
    
      // return res
      //   .status(statusCodes.badRequest)
      //   .json({ message: Messages.alreadyExists });
      return sendResponse(req,res,Messages.alreadyExists)
    const newUser = new AdminModel(req.body);
    const accesstoken = await jwt.sign(
      {
        _id: newUser._id,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
      },
      process.env.SECRET,
      { expiresIn: "2h" }
    );
    newUser.accessToken = accesstoken;
    const savedUser = await newUser.save();
    // res
    //   .status(statusCodes.created)
    //   .json({ message: Messages.registeredSuccessfully, data: savedUser });

    sendResponse(req,res,Messages.registeredSuccessfully,savedUser)
  } catch (err) {
    // res
    //   .status(statusCodes.internalServerError)
    //   .send(Messages.internalServerError);

    sendErrorResponse(req,res,Messages.internalServerError,statusCodes.internalServerError)
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const doesUserExist = await AdminModel.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    });
    if (!doesUserExist)
      // return res
      //   .status(statusCodes.badRequest)
      //   .json({ message: Messages.userNotFound });

      return sendResponse(req,res,Messages.userNotFound,statusCodes.badRequest)


    if (!doesUserExist.isValid(req.body.password))
      return res
        .status(statusCodes.badRequest)
        .json({ message: Messages.passwordIncorrect });
    const accesstoken = await jwt.sign(
      {
        _id: doesUserExist._id,
        username: doesUserExist.username,
        isAdmin: doesUserExist.isAdmin,
      },
      process.env.SECRET,
      { expiresIn: "2h" }
    );
    doesUserExist.accessToken = accesstoken;
    const saved = await doesUserExist.save();
    // res.status(statusCodes.OK).json({
    //   message: `${Messages.welcome} ${saved.username}`,
    //   oldToken: doesUserExist.accessToken,
    //   newToken: saved.accessToken,
    // });

    sendResponse(req,res,`${Messages.welcome} ${saved.username}`,statusCodes.OK,{oldToken : doesUserExist.accessToken,newToken : saved.accessToken})
  } catch (err) {
    // res
    //   .status(statusCodes.internalServerError)
    //   .send(Messages.internalServerError);


sendErrorResponse(req,res,Messages.internalServerError,statusCodes.internalServerError)


  }
};

exports.blockUnblock = async (req, res) => {
  try {
    const isUpdated = await UserModel.findOneAndUpdate(
      { _id: req.body._id },
      { isBlocked: req.body.isBlocked },
      { new: true }
    );
    // res.status(statusCodes.OK).json({
    //   message: isUpdated.isBlocked
    //     ? `${isUpdated.username} ${Messages.blockedSuccessfully}`
    //     : `${isUpdated.username} ${Messages.unblockedSuccessfully}`,
    // });
    sendResponse(req,res,isUpdated.isBlocked ? `${isUpdated.username} ${Messages.blockedSuccessfully}` : `${isUpdated.username} ${Messages.unblockedSuccessfully}`,statusCodes.OK)
  } catch (err) {
    // res
    //   .status(statusCodes.internalServerError)
    //   .send(Messages.internalServerError);
sendErrorResponse(req,res,)


  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const isUpdated = await UserModel.findOneAndUpdate(
      { _id: req.body._id },
      { isDeleted: true },
      { new: true }
    );
    if (!isUpdated)
      return res
        .status(statusCodes.internalServerError)
        .json({ message: Messages.internalServerError });
    res.status(statusCodes.OK).json({
      message: `${Messages.deletedSuccessfully} ${isUpdated.firstname} ${isUpdated.lastname}`,
    });
  } catch (err) {
    // next(err);
    res
      .status(statusCodes.internalServerError)
      .send(Messages.internalServerError);
  }
};

exports.activateDeactivateUser = async (req, res) => {
  try {
    const isUpdated = await UserModel.findOneAndUpdate(
      { _id: req.body._id },
      { isActive: req.body.isActive },
      { new: true }
    );
    res.status(statusCodes.OK).json({
      message: isUpdated.isActive
        ? `${isUpdated.username} ${Messages.active}`
        : `${isUpdated.username} ${Messages.deactivatedSuccessfully}`,
    });
  } catch (err) {
    res
      .status(statusCodes.internalServerError)
      .send(Messages.internalServerError);
  }
};

exports.UploadOne = async (req, res) => {
  try {
    const foundUser = await AdminModel.findOne({ _id: req.token._id });
    const files = `/static/admin/${req.file.path.split("\\")[2]}`;
    foundUser.image.push(files);
    const saved = await foundUser.save();
    res
      .status(statusCodes.OK)
      .json({ message: Messages.uploadOneImageSuccessfully, images: files });
  } catch (err) {
    return res
      .status(statusCodes.internalServerError)
      .send(Messages.internalServerError);
  }
};

exports.UploadMany = async (req, res) => {
  try {
    const foundUser = await AdminModel.findOne({ _id: req.token._id });
    const imageArr = req.files.map((resp) => {
      return `/static/admin/${resp.path.split("\\")[2]}`;
    });

    foundUser.image = [...foundUser.image, ...imageArr];
    await foundUser.save();
    res.status(statusCodes.OK).json({
      message: Messages.uploadedManyImagesSuccessfully,
      images: imageArr,
    });
  } catch (err) {
    return res
      .status(statusCodes.internalServerError)
      .send(Messages.internalServerError);
  }
};

exports.UploadFields = async (req, res) => {
  try {
    console.log(req.files);
    res
      .status(statusCodes.OK)
      .json({ message: Messages.uploadedImageFieldSuccessfully });
  } catch (err) {
    return res
      .status(statusCodes.internalServerError)
      .send(Messages.internalServerError);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let { pageNo, limit, search } = req.query;

    if (!search) search = "";
    if (!pageNo || pageNo < 1) pageNo = 1;
    if (!limit) limit = 10;
    let skipData = (pageNo - 1) * limit;

     const query = {
      $or: [
        { email: { $regex: search, $options: "$i" } },
        { firstname: { $regex: `^${search}`, $options: "$i" } },
        { username: { $regex: `^${search}`, $options: "$i" } },
      ],
    } 

    const countDocuments = await UserModel.countDocuments(query)

    const usersList = await UserModel.find(query)
      .skip(skipData)
      .limit(limit)
      .lean()
      .exec();



      
    // const usersList = await dummyModel.find({itemName : {$regex : search,$options : "$i"}}).skip(skipData)
    // .limit(limit)
// const usersList = await dummyModel.countDocuments({itemName : {$regex : search,$options : "$i"}})




    res.status(statusCodes.OK).json({
      message: `${usersList.length} ${Messages.usersFound}`,
      data: usersList,
    });
  } catch (err) {
    res
      .status(statusCodes.internalServerError)
      .send(Messages.internalServerError);
  }
};

exports.Dummy = async (req, res) => {
  try {
    const datas = await dummyModel.insertMany(req.body.data);
    res
      .status(statusCodes.created)
      .json({ message: Messages.successfullyInsertedDatas, data: datas });
  } catch (err) {
    res
      .status(statusCodes.internalServerError)
      .send(Messages.internalServerError);
  }
};

exports.deleteMany = async (req, res) => {
  try {
    await dummyModel.deleteMany();
    res.status(statusCodes.OK).json({ message: Messages.deletedSuccessFully });
  } catch (err) {
    res
      .status(statusCodes.internalServerError)
      .send(Messages.internalServerError);
  }
};
