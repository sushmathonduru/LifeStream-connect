const sequelize = require("../config/database");
const User = require("./User");
const Request = require("./Request");
const Notification = require("./Notification");

// Define Associations if needed
User.hasMany(Request, { foreignKey: 'userId', as: 'myRequests' });
User.hasMany(Request, { foreignKey: 'donorId', as: 'donations' });
User.hasMany(Notification, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Request,
  Notification
};
