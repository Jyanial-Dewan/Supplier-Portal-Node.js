const router = require('express').Router();
const userController = require('../controller/usersController');

router.get("/users", userController.getAllUsers);

module.exports = router;