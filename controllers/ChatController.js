// ChatController.js

const ChatService = require('../services/chatService');
const chatService = new ChatService();
const usersConnected = new Map();

// Get the messages for a specific user
exports.getMessages = (req, res) => {
    tryRequest(chatService.getMessages(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.sendMessage = (req, res) => {
    tryRequest(chatService.sendMessage(req.username, req.body), res, data => {
        return res.status(200).json({ success: data });
    });
}

exports.connection = (socket) => {
    usersConnected.set(socket.request.user, {'id': socket.id, 'socket': socket});
    socket.on('sendMessage', data => {
        chatService.sendMessage(socket.request.user, data).then( () => {
            usersConnected.get(socket.request.user).socket.emit('updateMessages', {'userSend': socket.request.user, 'userTarget': data.usernameTarget});
            if(usersConnected.get(data.usernameTarget)) {
                usersConnected.get(data.usernameTarget).socket.emit('updateMessages', {'userSend': socket.request.user, 'userTarget': data.usernameTarget});
            }
        });
    });
    
    socket.on('disconnect', () => {
        usersConnected.delete(socket.request.user);
    });
}

/**
 * execute the request, data returned or capture the exception throwed by the service
 * @param {HttpRequest} req - Service function to be executed.
 * @param {HttpResponse} res - The http response.
 * @param {requestCallback} callback - The callback that handles the response.
 */
async function tryRequest(req, res, callback) {
    try {
        callback(await req);
    } catch (e) {
        return toStatusCode(e, res);
    }
}

/**
 * Method that return an error message to the client, if something goes wrong
 */
function toStatusCode(e, res) {
    switch (e.constructor.name) {
        case 'BadRequestException':
            return res.status(400).json({ error: e.getMessage() });
        case 'UnauthorizedRequestException':
            return res.status(401).json({ error: e.getMessage() });
        case 'NotFoundException':
            return res.status(404).json({ error: e.getMessage() });
        case 'ConflictException':
            return res.status(409).json({ error: e.getMessage(), errors: e.getArgs() });
        case 'InternalErrorException':
            return res.status(500).json({ error: e.getMessage() });
    }
}