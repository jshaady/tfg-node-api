// Teams route module.

// Initialize express router
let router = require('express').Router();
const bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json();

// Require controller modules.
const teamController = require('../controllers/TeamController');
const tokenController = require('../controllers/TokenController');

router.post('/', jsonParser, tokenController.verify, teamController.createTeam);

router.put('/', jsonParser, tokenController.verify, teamController.editTeam);

router.get('/', teamController.getTeam);

router.put('/image', jsonParser, tokenController.verify, teamController.editTeamImage);

router.get('/search/uuid', jsonParser, tokenController.verify, teamController.searchByUuid);

router.get('/search', jsonParser, tokenController.verify, teamController.search);

router.get('/stats', jsonParser, teamController.stats);

router.post('/join', jsonParser, tokenController.verify, teamController.join);

router.delete('/left', jsonParser, tokenController.verify, teamController.left);

router.get('/uuid', jsonParser, tokenController.verify, teamController.getTeamUuid)

router.get('/joined', tokenController.verify, jsonParser, teamController.getAllMyTeams);

router.get('/created', tokenController.verify, teamController.getMyTeamsCreatedNames);

module.exports = router;