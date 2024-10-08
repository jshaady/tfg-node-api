// Championship route module.

// Initialize express router
let router = require('express').Router();
const bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json()

// Require controller modules.
const tokenController = require('../controllers/TokenController');
const championshipController = require('../controllers/ChampionshipController');

router.post('/', jsonParser, tokenController.verify, championshipController.createChampionship);

router.get('/', championshipController.getChampionship);

router.get('/all', championshipController.getAllChampionships);

router.post('/join', jsonParser, tokenController.verify, championshipController.join);

router.delete('/left', jsonParser, tokenController.verify, championshipController.left);

router.post('/generate/matches', jsonParser, tokenController.verify, championshipController.generateMatches);

router.post('/generate/next/phase', jsonParser, tokenController.verify, championshipController.generateNextPhase);

router.put('/set/result', jsonParser, tokenController.verify, championshipController.setResult);

router.post('/add/date', jsonParser, tokenController.verify, championshipController.addDate);

router.delete('/delete/date', jsonParser, tokenController.verify, championshipController.deleteDate);

router.put('/accept/date', jsonParser, tokenController.verify, championshipController.acceptDate);

router.get('/match/dates', jsonParser, tokenController.verify, championshipController.getMatchDates)

router.get('/participate', tokenController.verify, championshipController.participate);

router.get('/clasification', championshipController.clasification);

router.get('/matches', championshipController.getMatches);

router.get('/brackets/matches', championshipController.getBracketsMatches);

router.get('/user/next/matches', tokenController.verify, championshipController.getUserNextMatches);

module.exports = router;
