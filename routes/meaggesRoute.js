const router = require('express').Router();
const messagesController = require('../controller/messagesController');

router.get("/messages", messagesController.getAllMessagess);
router.get("/messages/:id", messagesController.getMessageById);
router.post("/messages", messagesController.createMessage);
router.delete("/messages/:id", messagesController.deleteMessage);
router.put("/messages/:id", messagesController.updateMessage);

module.exports = router;