export default class NotValidException {
  /**
   * Constructs Not Valid Exception.
   * @constructor
   * @param {Array} errors: Form field errors
   */
  constructor(errors) {
    this.errors = errors;
  }

  /**
   * Return the errors in input fields.
   * @return errors
   */
  getErrors() {
    return this.errors;
  }
}
