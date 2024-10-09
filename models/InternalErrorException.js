import Exception from "./Exception.js";

export default class InternalErrorException extends Exception {
  /**
   * Constructs Internal Error Exception.
   * @constructor
   * @param {String} message: Error message
   */
  constructor(message) {
    super(message);
  }
}
