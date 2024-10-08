class Exception {

    /**
     * Constructs Exception.
     * @constructor
     * @param {String} message: Error message
     */
    constructor(message) {
        this.message = message;
    }

    getMessage() {
        return this.message;
    }
}
module.exports = Exception;