const ConflictException = require('../models/ConflictException');

const Message = require('../models/Message');
const ChatMapper = require('../mapper/ChatMapper');
const chatMapper = new ChatMapper();

const dateformat = require('dateformat');

class ChatService {

    
    /**
    * Constructs Chat Service.
    * @constructor
    */
    constructor() { }
    
    /**
     * Get championships matches
     * @param  {HttpRequest} req - Request from client
     * @return  {JSON} if have matches : JSON array of Message Objects
     * @return  {JSON} if not have messages: Empty array
     */
    async getMessages(req) {
        const messages = await chatMapper.getMessages(req.username, req.query.userTarget);
        if (messages.length === 0) {
            return [];
        } else {
            let messagesArray = [];
            let lastMessageUser = null;
            let messageGroup = null;
            messages.forEach(message => {
                if (lastMessageUser === message.senduser) {
                    messageGroup.setMessageInArray({ messageContent: message.messagecontent });
                }
                else {
                    if (lastMessageUser !== null) {
                        messagesArray.push(messageGroup);
                    }
                    messageGroup = new Message(message.senduser, message.targetuser, null, dateformat(message.senddate, "dd-mm-yyyy HH:MM"));
                    messageGroup.setMessageInArray({ messageContent: message.messagecontent });
                }
                lastMessageUser = message.senduser;
            });
            messagesArray.push(messageGroup);
            return messagesArray;
        }
    }

    /**
     * Send a message
     * @param  {HttpRequest} req - Request from client
     */
    async sendMessage(username, data) {
        const message = new Message(username, data.usernameTarget, data.message, data.date);
        try {
            message.isValidForCreate();
        } catch (e) {
            throw new ConflictException('Incorrect data', e.getErrors());
        }
        const messageInsert = {
            senduser: message.getSendUser(),
            targetuser: message.getTargetUser(),
            messagecontent: message.getMessage(),
            senddate: message.getSendDate()
        }
        await chatMapper.sendMessage(messageInsert);
        return;
    }
}
module.exports = ChatService;