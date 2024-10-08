// Chat route module.

// Initialize express router
let router = require('express').Router();

// Require controller modules.
const chatController = require('../controllers/ChatController');
const tokenController = require('../controllers/TokenController');

// Get Messages for a specific user
router.get('/', tokenController.verify, chatController.getMessages);

module.exports = router;
