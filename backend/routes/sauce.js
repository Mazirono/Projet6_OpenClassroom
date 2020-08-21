const express = require('express');
const router = express.Router();

const stuffCtrl = require('../controllers/sauce');
const multer = require('../middleware/multer-config');

const auth = require('../middleware/auth');


router.post('/',auth,multer,stuffCtrl.createThing);
router.post('/:id/like',auth,stuffCtrl.likeThing);
router.get('/', auth, stuffCtrl.getAllStuff);
router.get('/:id',auth, stuffCtrl.getOneThing);
router.delete('/:id',auth, stuffCtrl.deleteThing);
router.put('/:id',auth, multer,stuffCtrl.modifyThing);

module.exports = router;