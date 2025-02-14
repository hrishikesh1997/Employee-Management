const express = require('express');
const app = express();
//app.use(express.static("static"));
app.use(express.json());

const port = 3010;

let {sequelize} =require("./lib/index");

let {department} =require("./models/department");

let {role } = require("./models/role")

let {employee} =require("./models/employee")

let {employeeDepartment} =require("./models/employeeDepartment")

let {employeeRole} =require("./models/employeeRole")

// Helper function to get employee's associated departments
async function getEmployeeDepartments(employeeId) {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { employeeId },
  });

  let departmentData;
  for (let empDep of employeeDepartments) {
    departmentData = await department.findOne({
      where: { id: empDep.departmentId },
    });
  }

  return departmentData;
}
async function getEmployeeRoles(employeeId){
 /*  const employeeRoles = await employeeRole.findAll({
    where: { employeeId },
  });

  let roleData;
  for (let empRole of employeeRoles) {
    roleData = await role.findOne({
      where: { id: empRole.roleId },
    });
  }

  return roleData; */

  try {
    // Fetch all roles associated with the employee
    const employeeRoles = await employeeRole.findAll({
      where: { employeeId },
    });

    // If no roles are found, return an empty array
    if (!employeeRoles || employeeRoles.length === 0) {
      return [];
    }

    // Fetch detailed role data for each role
    const roleData = [];
    for (let empRole of employeeRoles) {
      const roleDetail = await role.findOne({
        where: { id: empRole.roleId },
      });

      if (roleDetail) {
        roleData.push(roleDetail);
      }
    }

    return roleData; // Return all role details
  } catch (error) {
    throw new Error(`Error fetching employee roles: ${error.message}`);
  }
}

// Helper function to get employee details with associated departments and roles
async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);

  return {
    ...employeeData.dataValues,
    department,
    role,
  };
}





app.get("/seed_db",async(req,res)=>{
   try{
     await sequelize.sync({ force: true });

     const departments = await department.bulkCreate([
       { name: 'Engineering' },
       { name: 'Marketing' },
     ]);

     const roles = await role.bulkCreate([
       { title: 'Software Engineer' },
       { title: 'Marketing Specialist' },
       { title: 'Product Manager' },
     ]);

     const employees = await employee.bulkCreate([
       { name: 'Rahul Sharma', email: 'rahul.sharma@example.com' },
       { name: 'Priya Singh', email: 'priya.singh@example.com' },
       { name: 'Ankit Verma', email: 'ankit.verma@example.com' },
     ]);

     // Associate employees with departments and roles using create method on junction models
     await employeeDepartment.create({
       employeeId: employees[0].id,
       departmentId: departments[0].id,
     });
     await employeeRole.create({
       employeeId: employees[0].id,
       roleId: roles[0].id,
     });

     await employeeDepartment.create({
       employeeId: employees[1].id,
       departmentId: departments[1].id,
     });
     await employeeRole.create({
       employeeId: employees[1].id,
       roleId: roles[1].id,
     });

     await employeeDepartment.create({
       employeeId: employees[2].id,
       departmentId: departments[0].id,
     });
     await employeeRole.create({
       employeeId: employees[2].id,
       roleId: roles[2].id,
     });

     return res.status(200).json({ message: 'Database seeded!' });
   }catch(error){
     res.status(500).json({error:error.message})
   }
})

 async function getAllEmpoyee(){
   let employeeData = await employee.findAll();

   let employees =[];
   for(let i=0;i<employeeData.length;i++){
     employees.push(await getEmployeeDetails(employeeData[i]))
   }

   return {employees}

} 



app.get("/employees",async(req,res)=>{
  try {

      let response = await getAllEmpoyee();
      if(response.employees.length === 0){
        return res.status(404).json({meesage:"no employee found"})
      }
     return  res.status(200).json(response);
  } catch (error) {
    console.error("Error in /employees route:", error.message);
    res.status(500).json({error:error.message})
  }
})


async function GetemployeeByDepartment(departmentId){
  let employeeDepartments = await employeeDepartment.findAll({
    where:{departmentId}
  });

  /* let employeeData;
  for(let empId of employeeDepartments){
    employeeData = await employee.findAll({
       where:{id:empId.employeeId}
    })
  } */
  let employeeData =[];
  for(let i=0;i<employeeDepartments.length;i++){
    employeeData.push(await employee.findOne({
       where:{id:employeeDepartments[i].employeeId}
    }))
  }

  let result = []
  for(let i=0;i<employeeData.length;i++){
      result.push(await getEmployeeDetails(employeeData[i]));
  }


  return {result}

}

app.get("/employees/department/:departmentId",async(req,res)=>{
try {
let departmentId = req.params.departmentId;
let response = await GetemployeeByDepartment(departmentId);
  if(response.result.length === 0){
    return res.status(404).json({message:"no employee found"})
  }
res.status(200).json(response)
} catch (error) {
res.status(500).json({error:error.message})
}
});


app.get("/employees/details/:id",async(req,res)=>{
  try{
    let id = req.params.id;
    let employeeData = await employee.findOne({
      where:{id}
    });
    if(!employeeData){
      return res.status(404).json({message:"no employee found"})
    }
    let response = await getEmployeeDetails(employeeData);
    res.status(200).json(response)
  }catch(error){
    res.status(500).json({error:error.message})
  }
})


app.get("/employees/role/:roleId",async(req,res)=>{
  try{
    let roleId = req.params.roleId;
    let employeeRoles = await employeeRole.findAll({
      where:{roleId}
    });
    let employeeData =[];
    for(let i=0;i<employeeRoles.length;i++){
      employeeData.push(await employee.findOne({
        where:{id:employeeRoles[i].employeeId}
      }))
    }
    let result = []
    for(let i=0;i<employeeData.length;i++){
      result.push(await getEmployeeDetails(employeeData[i]));
    }
    res.status(200).json(result)
  }catch(error){
    res.status(500).json({error:error.message})
  }
})

/* async function GetSortedData(response,order) {
  let sortorder = response.findAll({order : [["name",order]]})
  return {sortorder}
 } */

app.get("/employees/sort-by-name",async(req,res)=>{
   try {
     let order = req.query.order;
     let result = await employee.findAll({order : [["name",order]]});
     if(result.length === 0)
     {
       return res.status(404).json({message : " No Data"})
     }
     let response =[];
     for(let i=0;i<result.length;i++){
         response.push(await getEmployeeDetails(result[i]));
     }

       

       res.status(200).json(response);

   } catch (error) {
     res.status(500).json({error:error.meesage})
   }

})

async function AddNewUser(newUser) {
  try {
    // Create the new employee
    const newEmployee = await employee.create({
      name: newUser.name,
      email: newUser.email,
    });

    // Associate the employee with the department
    if (newUser.departmentId) {
      await employeeDepartment.create({
        employeeId: newEmployee.id,
        departmentId: newUser.departmentId,
      });
    }

    // Associate the employee with the role
    if (newUser.roleId) {
      await employeeRole.create({
        employeeId: newEmployee.id,
        roleId: newUser.roleId,
      });
    }

    // Fetch full employee details, including department and role
    const employeeDetails = await getEmployeeDetails(newEmployee);

    return {employeeDetails};
  } catch (error) {
    throw new Error(`Error creating new user: ${error.message}`);
  }
}


   app.post("/employees/new",async(req,res)=>{
      try {
        let newUser = req.body;
        if (!newUser.name || !newUser.email || !newUser.departmentId || !newUser.roleId) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        let response = await AddNewUser(newUser);

        /* if(response.employeeDetails.lenght === 0){
          return res.status(404).json({err})
        } */
        res.status(200).json(response)
      } catch (error) {
        res.status(500).json({error:error.meesage})
      }

   })


app.post("/employees/update/:id",async(req,res)=>{
  try{
    let id = req.params.id;
    let employeeData = await employee.findOne({
      where:{id}
    });
    if(!employeeData){
      return res.status(404).json({message:"no employee found"})
    }
    let newUser = req.body;
    
    
    let response = await employee.update({
      name: newUser.name,
      email: newUser.email,
    },{
      where:{id}
    });

    if(newUser.departmentId){
      await employeeDepartment.update({
        departmentId: newUser.departmentId,
      },{
        where:{employeeId:id}
      });
    }

    if(newUser.roleId){
      await employeeRole.update({
        roleId: newUser.roleId,
      },{
        where:{employeeId:id}
      });
    }
    if(response[0] === 0){
      return res.status(404).json({message:"no employee found"})
    }

    let employeeData1 = await employee.findOne({
      where:{id}
    });
    let employeeDetails = await getEmployeeDetails(employeeData1);
    res.status(200).json(employeeDetails)
  }catch(error){
    res.status(500).json({error:error.message})
  }
})

app.post("/employees/delete",async(req,res)=>{
  try{
    let id = req.body.id;
    let employeeData = await employee.findOne({
      where:{id}
    });
    if(!employeeData){
      return res.status(404).json({message:"no employee found"})
    }
    let response = await employee.destroy({
      where:{id}
    });
    if(response[0] === 0){
      return res.status(404).json({message:"no employee found"})
    }
    res.status(200).json({ message: `Employee with ID ${id} has been deleted.` })
  }catch(error){
    res.status(500).json({error:error.message})
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})