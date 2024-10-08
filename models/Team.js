const NotValidException = require('./NotValidException');

class Team {

    /**
     * Constructs Team.
     * @constructor
     * @param {String} teamname: Name of the team.
     * @param {String} userLeader: Team creator username.
     * @param {String} description: Team description.
     * @param {String} createDate: Team creation date .
     * @param {String} location: Team location.
     * @param {String} imageBase64: Team image, saved on base 64.
     * @param {String} imageType: Team image type (jpg, png).
     * @param {String} isPrivate: Team type, 0 represents a public team, 1 represents a private team.
     * @param {String} uuid: Team uuid, necessary to join a private team.
     * @param {String} maxNumberPlayers: maximum number of players.
     */
    constructor(teamname = null, userLeader = null, description = null, createDate = null, location = null,
        imageBase64 = null, imageType = null, isPrivate = null, uuid = null, maxNumberPlayers = null) {
        this.teamname = teamname
        this.userLeader = userLeader
        this.description = description
        this.createDate = createDate
        this.location = location
        this.imageBase64 = imageBase64
        this.imageType = imageType
        this.isPrivate = isPrivate
        this.uuid = uuid,
        this.maxNumberPlayers = maxNumberPlayers,
        this.usersInTeam = []
    }

    getTeamname() {
        return this.teamname;
    }

    getUserLeader() {
        return this.userLeader;
    }

    getDescription() {
        return this.description;
    }

    getCreateDate() {
        return this.createDate;
    }

    getLocation() {
        return this.location;
    }

    getUsersInTeam() {
        return this.usersInTeam;
    }

    getImageBase64() {
        return this.imageBase64;
    }

    getImageType() {
        return this.imageType;
    }

    setUserInTeam(user) {
        this.usersInTeam.push(user);
    }

    getIsPrivate() {
        return this.isPrivate;
    }

    getUuid() {
        return this.uuid;
    }

    getMaxNumberPlayers() {
        return this.maxNumberPlayers;
    }

    setUsersInTeamEmpty() {
        this.usersInTeam = [];
    }

    /**
     * Method that validates if a Team can be created
     */
    isValidForCreate() {
        let errors = {};
        let hasErrors = false;
        const today = new Date();
        const tomorrow = new Date(today);
        const yesterday = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1);
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.teamname === null) {
            errors['teamNameNull'] = "The name cannot be null";
            hasErrors = true;
        } else if (this.teamname.trim().length < 5) {
            errors['teamNameMinLength'] = "Team name cannot have less than 5 characters";
            hasErrors = true;
        } else if (this.teamname.trim().length > 20) {
            errors['teamNameMaxLength'] = "Team name cannot have more than 20 characters";
            hasErrors = true;
        }

        if (this.userLeader.length === null) {
            errors['userLeaderNull'] = "The user leader cannot be null";
            hasErrors = true;
        } else if (this.userLeader.trim().length < 1) {
            errors['userLeaderMinLength'] = 'User Leader cannot be empty';
            hasErrors = true;
        } else if (this.userLeader.trim().length > 20) {
            errors['userLeaderMaxLength'] = 'User Leader cannot have more than 20 characters';
            hasErrors = true;
        }

        if (parseInt(this.isPrivate, 10) !== 0 && parseInt(this.isPrivate, 10) !== 1) {
            errors['isPrivate'] = 'State has an incorrect value';
            hasErrors = true;
        }

        if (this.location === null) {
            errors['locationNull'] = "The location cannot be null";
            hasErrors = true;
        } else if (this.location.trim().length > 255) {
            errors['teamLocationMaxLength'] = 'Location cannot have more than 255 characters';
            hasErrors = true;
        } else if (this.location.trim().length < 1) {
            errors['teamLocationMinLength'] = 'Location cannot be empty';
            hasErrors = true;
        }

        if (this.description === null) {
            errors["teamDescriptionNull"] = "Description cannot be null";
            hasErrors = true;
        } else if (this.description.trim().length > 512) {
            errors["teamDescriptionMaxLength"] = "Description cannot have more than 512 characters";
            hasErrors = true;
        } else if (this.description.trim().length < 5) {
            errors["teamDescriptionMinLength"] = "Description cannot be less than 5 characters";
            hasErrors = true;
        }

        if (this.maxNumberPlayers === null) {
            errors['maxNumberPlayersNull'] = "The maximum number of players cannot be null";
            hasErrors = true;
        } else if (this.maxNumberPlayers < 2) {
            errors['maxNumberPlayersMinSize'] = "The maximum number of players cannot be less than 1";
            hasErrors = true;
        } else if (this.maxNumberPlayers > 25) {
            errors['maxNumberPlayersMaxSize'] = "The maximum number of players cannot be greater than 25";
            hasErrors = true;
        }

        if (this.createDate === null) {
            errors["dateNull"] = "The date cannot be null";
            hasErrors = true;
        } else if (new Date(this.date) > tomorrow || new Date(this.date) < yesterday) {
            errors["dateIncorrect"] = "Incorrect date";
            hasErrors = true;
        }

        if (hasErrors) {
            throw new NotValidException(errors);
        }
    }

    /**
     * Method that validates if a Team can be updated
     */
    isValidForUpdate() {
        let errors = {};
        let hasErrors = false;

        if (this.location === null) {
            errors['locationNull'] = "The location cannot be null";
            hasErrors = true;
        } else if (this.location.length > 255) {
            error['teamLocationMaxLength'] = 'Location cannot have more than 255 characters';
            hasErrors = true;
        } else if (this.location.length < 1) {
            errors['teamLocationMinLength'] = 'Location cannot be empty';
            hasErrors = true;
        }

        if (this.description === null) {
            error["teamDescriptionNull"] = "Description cannot be null";
            hasErrors = true;
        } else if (this.description.length > 512) {
            error["teamDescriptionMaxLength"] = "Description cannot have more than 512 characters";
            hasErrors = true;
        } else if (this.description.length < 5) {
            error["teamDescriptionMinLength"] = "Description cannot be less than 5 characters";
            hasErrors = true;
        }

        if (hasErrors) {
            throw new NotValidException(errors);
        }
    }
}
module.exports = Team;