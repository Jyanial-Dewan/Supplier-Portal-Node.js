const router = require('express').Router()
const departmentsController = require('../controller/categoryController')

router.get("/departments", departmentsController.getAllDepartments);
router.get("/departments/:id", departmentsController.getDepartmentById);
router.post("/departments", departmentsController.createDepartment);
router.post("/upsert-departments", departmentsController.upsertMultipleDepartments);
router.put("/departments/:id", departmentsController.updateDepartment);
router.delete("/departments/:id", departmentsController.deleteDepartment);

  module.exports = router;