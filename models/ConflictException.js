import Exception from "./Exception.js";

export default class ConflictException extends Exception {
  /**
   * Constructs Conflict Exception.
   * @constructor
   * @param {String} message: Error message
   * @param {Array} errors: Form field error
   */
  constructor(message, errors = null) {
    super(message);
    this.errors = errors;
  }

  getArgs() {
    return this.errors;
  }
}
