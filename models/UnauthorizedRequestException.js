import Exception from "./Exception.js";

export default class UnauthorizedRequestException extends Exception {
  /**
   * Constructs Not Found Exception.
   * @constructor
   * @param {String} message: Error message
   */
  constructor(message) {
    super(message);
  }
}
