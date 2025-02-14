let {DataTypes,sequelize }  = require("../lib");
const { employee } = require("./employee");
const {role} =require("./role")

let employeeRole = sequelize.define("employeeRole",{
    employeeId:{
        type:DataTypes.INTEGER,

        References:{
           model:employee,
           key:"id"
        }
    },

    roleId:{
        type:DataTypes.INTEGER,

        References:{
            model:role,
            key:"id"
        }
    }
});

employee.belongsToMany(role, { through: employeeRole });
role.belongsToMany(employee,{through:employeeRole});
module.exports = {employeeRole}