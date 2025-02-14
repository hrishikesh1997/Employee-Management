let {DataTypes,sequelize} = require("../lib");

let {department} = require("./department")

let {employee} = require("./employee")

let employeeDepartment = sequelize.define("employeeDepartment",{
  employeeId:{
      type:DataTypes.INTEGER,
      References:{
         model:employee,
         key:"id"
      }
  },

  departmentId:{
      type:DataTypes.INTEGER,
      References:{
          model:department,
          key:"id"
      }
  }
})

employee.belongsToMany(department,{through:employeeDepartment})
department.belongsToMany(employee,{through:employeeDepartment})
module.exports ={employeeDepartment}