const NotValidException = require('./NotValidException');

class Meet {

    /**
     * Constructs Meet.
     * @constructor
     * @param {Number} id: Meet id.
     * @param {String} name: Meet name.
     * @param {String} userCreator: username of the meet creator.
     * @param {String} date: Meet date.
     * @param {String} sport: Meet sport.
     * @param {String} description: Meet description.
     * @param {String} location: Meet location.
     */
    constructor(id = null, name = null, userCreator = null, date = null, sport = null, description = null, location = null) {
        this.id = id;
        this.name = name ? name.trim() : null;
        this.userCreator = userCreator ? userCreator.trim() : null;
        this.sport = sport = sport ? sport.trim() : null;
        this.description = description ? description.trim() : null;
        this.location = location ? location.trim() : null;
        this.date = date;
        this.usersInMeet = [];
        this.participants = 0;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getUserCreator() {
        return this.userCreator;
    }

    getDate() {
        return this.date;
    }

    getSport() {
        return this.sport;
    }

    getDescription() {
        return this.description;
    }

    getUserCretor() {
        return this.userCreator;
    }

    getParticipants() {
        this.participants;
    }

    getLocation() {
        return this.location;
    }

    setParticipants(participantNumber) {
        this.participants = participantNumber;
    }

    setUserInMeet(User) {
        this.usersInMeet.push(User);
    }

    setUsersInMeet(users) {
        this.usersInMeet = users;
    }

    /**
     * Method that validates if a Meet can be created
     */
    isValidForCreate() {
        let hasErrors = false;
        let errors = {};
        const today = new Date();
        const date = new Date(this.date);
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.name === null) {
            errors["meetNameNull"] = "Name cannot be null";
            hasErrors = true;
        } else if (this.name.length > 60) {
            errors["meetNameMaxLength"] = "Name cannot have more than 60 characters";
            hasErrors = true;
        } else if (this.name.length < 5) {
            errors["meetNameMinLength"] = "Name cannot be less than 5 characters";
            hasErrors = true;
        }

        if (this.sport === null) {
            errors["meetSportNull"] = "Sport cannot be null";
            hasErrors = true;
        } else if (this.sport.length > 25) {
            errors["meetSportMaxLength"] = "Sport cannot have more than 25 characters";
            hasErrors = true;
        } else if (this.sport.length < 5) {
            errors["meetSportMinLength"] = "Sport cannot be less than 5 characters";
            hasErrors = true;
        }

        if (this.location === null) {
            errors["meetLocationNull"] = "Location cannot be null";
            hasErrors = true;
        } else if (this.location.length > 255) {
            errors["meetLocationMaxLength"] = "Location cannot have more than 255 characters";
            hasErrors = true;
        } else if (this.location.length < 1) {
            errors["meetLocationMinLength"] = "Location cannot be empty";
            hasErrors = true;
        }

        if (this.description === null) {
            errors["meetDescriptionNull"] = "Description cannot be null";
            hasErrors = true;
        } else if (this.description.length > 512) {
            errors["meetDescriptionMaxLength"] = "Description cannot have more than 512 characters";
            hasErrors = true;
        } else if (this.description.length < 5) {
            errors["meetDescriptionMinLength"] = "Description cannot be less than 5 characters";
            hasErrors = true;
        }

        if (this.date === null) {
            errors["dateNull"] = "The date cannot be null";
            hasErrors = true;
        } else if (isNaN(date.getTime()) || date < yesterday) {
            errors["dateIncorrect"] = "Incorrect date";
            hasErrors = true;
        }

        if (hasErrors) {
            throw new NotValidException(errors);
        }
    }
}
module.exports = Meet;