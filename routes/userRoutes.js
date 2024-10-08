// Users route module.

// Initialize express router
let router = require('express').Router();
const bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json()

// Require controller modules.
const userController = require('../controllers/UserController');
const tokenController = require('../controllers/TokenController');

router.delete('/', jsonParser, tokenController.verify, userController.delete);

router.put('/', jsonParser, tokenController.verify, userController.updateProfile);

router.put('/image', jsonParser, tokenController.verify, userController.updateProfileAvatar);

router.post('/signin', jsonParser, userController.signIn);

router.post('/signup', jsonParser, userController.signUp);

router.get('/profile', jsonParser, tokenController.verify, userController.profile);

router.get('/search', userController.search);

router.get('/checkuser', tokenController.verify, userController.checkUser);

router.get('/userchats', tokenController.verify, userController.getChatUsers);

router.get('/stats', userController.getStats);

router.get('/events', tokenController.verify, userController.events);

router.get('/list', tokenController.verify, userController.getUsersList);

router.get('/confirmation/:emailToken', userController.confirmation);

router.get('/resend/email', userController.resendEmail);

module.exports = router;