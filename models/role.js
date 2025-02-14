const { title } = require("process");
let { DataTypes, sequelize } = require("../lib");

let role = sequelize.define("role",{
  title :{
    type:DataTypes.STRING,
  }
})

module.exports = {role}

