const Exception = require('./Exception');

class UnauthorizedRequestException extends Exception {

    /**
     * Constructs Not Found Exception.
     * @constructor
     * @param {String} message: Error message
     */
    constructor(message) {
        super(message)
    }
}
module.exports = UnauthorizedRequestException;