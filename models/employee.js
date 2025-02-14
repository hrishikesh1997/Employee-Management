let {DataTypes,sequelize} = require("../lib");

let employee = sequelize.define("employee",{
   name:{
      type:DataTypes.STRING,
   },
  email:{
    type:DataTypes.STRING,
    validator:{
      isEmail:true
    }
  }
});

module.exports ={employee}