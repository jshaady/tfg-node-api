const Exception = require('./Exception');

class NotFoundException extends Exception {

    /**
     * Constructs Not Found Exception.
     * @constructor
     * @param {String} message: Error message
     */
    constructor(message) {
        super(message)
    }
}
module.exports = NotFoundException;