// ChatMapper.js

const InternalErrorException = require('../models/InternalErrorException');

class ChatMapper {

    /**
    * Constructs Chat Mapper.
    * @constructor
    */
    constructor() {
        this.connection = require('../core/dbconnection');
    }

    /** 
     * Save a message into database
     * @param {JSON} message
     */
    async sendMessage(message) {
        try {
            await this.connection.query('INSERT INTO messages SET ?', [message]);
            return;
        }
        catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

     /** 
     * Get mesasge between two users
     * @param {String} username issuer username
     * @param {String} targetUsername receiver username
     */
    async getMessages(username, targetUsername) {
        try {
            const [messages] = await this.connection.query('SELECT * FROM messages WHERE (senduser = ? AND targetuser = ?) OR ' +
                '(senduser = ? AND targetuser = ?) ORDER BY senddate', [username, targetUsername, targetUsername, username]);
            return messages;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }
}
module.exports = ChatMapper;