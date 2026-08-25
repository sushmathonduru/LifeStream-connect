const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.STRING, // Using string to maintain compatibility with existing uid if they want to migrate, or just UUID
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bloodGroup: {
    type: DataTypes.STRING,
  },
  isDonor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  locationLat: {
    type: DataTypes.FLOAT,
  },
  locationLng: {
    type: DataTypes.FLOAT,
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  gender: {
    type: DataTypes.STRING,
  },
  dateOfBirth: {
    type: DataTypes.STRING, // Storing as YYYY-MM-DD
  },
  lastDonation: {
    type: DataTypes.STRING, // Storing as YYYY-MM-DD
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = User;
