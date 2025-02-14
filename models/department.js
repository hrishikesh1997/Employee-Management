const { type } = require("os");
let { DataTypes, sequelize } = require("../lib");

let department = sequelize.define("department",{
  name:{
    type:DataTypes.STRING,
  }
});


module.exports = {department}