const router = require('express').Router();
const attributesController = require('../controller/attributesController');

router.get("/attributes", attributesController.getAttributes);
router.post("/attributes", attributesController.createAttribute);
router.post("/upsert-attributes", attributesController.upsertMultipleAttributes);
router.delete("/attributes/:id", attributesController.deleteAttribute);

module.exports = router