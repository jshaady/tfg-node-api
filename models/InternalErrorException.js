const Exception = require('./Exception');

class InternalErrorException extends Exception {

    /**
     * Constructs Internal Error Exception.
     * @constructor
     * @param {String} message: Error message
     */
    constructor(message) {
        super(message)
    }
}
module.exports = InternalErrorException;