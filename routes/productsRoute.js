const router = require('express').Router();
const employeeController = require('../controller/productsController')

router.get("/employees", employeeController.getAllEmployees);
router.get("/employees/:id", employeeController.getEmployeeByID);
router.post("/employees", employeeController.createEmployee);
router.post("/upsert-employees", employeeController.upsertMultipleEmployees);
router.put("/employees/:id", employeeController.updateEmployee);
router.delete("/employees/:id", employeeController.deleteEmployee);

module.exports = router