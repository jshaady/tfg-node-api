import Exception from "./Exception.js";

export default class BadRequestException extends Exception {
  /**
   * Constructs Bad Request Exception.
   * @constructor
   * @param {String} message: Error message
   */
  constructor(message) {
    super(message);
  }
}
