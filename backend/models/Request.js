const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Request = sequelize.define("Request", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  patientName: {
    type: DataTypes.STRING,
  },
  bloodGroup: {
    type: DataTypes.STRING,
  },
  hospital: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  units: {
    type: DataTypes.INTEGER,
  },
  urgency: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING, // "pending", "accepted", "completed"
    defaultValue: "pending",
  },
  donorId: {
    type: DataTypes.STRING, // ID of the user who accepted
  },
  isEmergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  acceptedAt: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = Request;
