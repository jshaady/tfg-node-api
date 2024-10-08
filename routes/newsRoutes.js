// News route module.

// Initialize express router
let router = require('express').Router();
const bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json();

// Require controller modules.
const tokenController = require('../controllers/TokenController');
const newsController = require('../controllers/NewsController');

router.post('/', tokenController.verify, newsController.createNews);

router.get('/', tokenController.verify, jsonParser, newsController.getNews);

module.exports = router;