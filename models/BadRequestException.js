const Exception = require('./Exception');

class BadRequestException extends Exception {

    /**
     * Constructs Bad Request Exception.
     * @constructor
     * @param {String} message: Error message
     */
    constructor(message) {
        super(message)
    }
}
module.exports = BadRequestException;