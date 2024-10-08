const NotValidException = require('./NotValidException');

class Message {

    /**
     * Constructs Message.
     * @constructor
     * @param {String} sendUser: Username of the person who send the message.
     * @param {String} targetUser: Username of the user who recives the message.
     * @param {String} message: Message content.
     * @param {Date} sendDate: Message send date.
     */
    constructor(sendUser = null, targetUser = null, message = null, sendDate = 0) {
        this.sendUser = sendUser ? sendUser.trim() : null;
        this.targetUser = targetUser ? targetUser.trim() : null;
        this.message = message ? message.trim() : null;
        this.sendDate = sendDate;
        this.messageArray = [];
    }

    getSendUser() {
        return this.sendUser;
    }

    getTargetUser() {
        return this.targetUser;
    }

    getMessage() {
        return this.message;
    }

    getMessageArray() {
        return this.message;
    }

    setMessageInArray(message) {
        this.messageArray.push(message)
    }

    getSendDate() {
        return this.sendDate;
    }

    /**
     * Method that validates if a News can be created
     */
    isValidForCreate() {
        let errors = {};
        let hasErrors = false;

        if (this.targetUser == null) {
            errors["error"] = "Target user cannot be null";
            hasErrors = true;
        }
        else if (this.targetUser.length < 1) {
            errors["error"] = "Target user cannot be empty";
            hasErrors = true;
        }
        else if (this.targetUser.length > 20) {
            errors["error"] = "Target user cannot have more than 20 characters";
            hasErrors = true;
        }

        if (this.sendUser == null) {
            errors["error"] = "Send user cannot be null";
            hasErrors = true;
        }
        else if (this.sendUser.length < 1) {
            errors["error"] = "Send user cannot be empty";
            hasErrors = true;
        }
        else if (this.sendUser.length > 20) {
            errors["error"] = "Send user cannot have more than 20 characters";
            hasErrors = true;
        }

        if (this.message == null) {
            errors["error"] = "Message cannot be null";
            hasErrors = true;
        }
        else if (this.message.length < 1) {
            errors["error"] = "Message cannot be empty";
            hasErrors = true;
        }
        else if (this.message.length > 512) {
            errors["error"] = "Message cannot have more than 512 characters";
            hasErrors = true;
        }

        if (this.sendDate === null) {
            errors["error"] = "Send date cannot be null";
            hasErrors = true;
        } else if (isNaN(new Date(this.sendDate).getTime())) {
            errors["error"] = "Send date format is incorrect";
            hasErrors = true;
        }
        if (hasErrors) {
            throw new NotValidException(errors);
        }
    }
}
module.exports = Message;