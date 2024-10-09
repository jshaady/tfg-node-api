// ChatMapper.js

import InternalErrorException from "../models/InternalErrorException.js";
import { pool as connection } from "../core/dbconnection.js";

export default class ChatMapper {
  /**
   * Constructs Chat Mapper.
   * @constructor
   */
  constructor() {}

  /**
   * Save a message into database
   * @param {JSON} message
   */
  async sendMessage(message) {
    try {
      await connection.query("INSERT INTO messages SET ?", [message]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get mesasge between two users
   * @param {String} username issuer username
   * @param {String} targetUsername receiver username
   */
  async getMessages(username, targetUsername) {
    try {
      const [messages] = await connection.query(
        "SELECT * FROM messages WHERE (senduser = ? AND targetuser = ?) OR " +
          "(senduser = ? AND targetuser = ?) ORDER BY senddate",
        [username, targetUsername, targetUsername, username]
      );
      return messages;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }
}
