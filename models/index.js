const userModel = require('./user')
const adminModel = require('./admin')
const dummyModel = require('./dummy')

module.exports = {
    UserModel:userModel,
    AdminModel:adminModel,
    dummyModel,
}