// Meet route module.

// Initialize express router
let router = require('express').Router();
const bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json();

// Require controller modules.
const tokenController = require('../controllers/TokenController');
const meetController = require('../controllers/MeetController');

router.post('/', jsonParser, tokenController.verify, meetController.createMeet);

router.get('/', jsonParser, meetController.getMeet);

router.post('/join', jsonParser, tokenController.verify, meetController.joinMeet);

router.delete('/left', jsonParser, tokenController.verify, meetController.leftMeet);

router.get('/list', meetController.getMeets);

module.exports = router;