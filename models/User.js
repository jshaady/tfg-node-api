const NotValidException = require('./NotValidException');

class User {

    /**
     * Constructs User.
     * @constructor
     * @param {String} username: User username, cannot be changed.
     * @param {String} name: User name.
     * @param {String} surname: User surname.
     * @param {String} email: User email, cannot be changed.
     * @param {Date} birthdate: User birthdate.
     * @param {String} country: User country.
     * @param {Number} rol: User rol, 0 represents normal users, 1 represents admins.
     * @param {String} imageBase64: User image, saved on base 64.
     * @param {String} imageType: User image type (jpg, png).
     * @param {String} description: User description.
     */
    constructor(username = null, name = null, surname = null, email = null, birthdate = null, country = null, location = null, rol = 0,
        imageBase64 = null, imageType = null, description = null) {
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.birthdate = birthdate;
        this.country = country;
        this.location = location;
        this.rol = rol;
        this.imageBase64 = imageBase64;
        this.imageType = imageType;
        this.description = description;
        this.token = null;
        this.password = null;
        this.teams = []
    }

    getUsername() {
        return this.username;
    }

    getName() {
        return this.name;
    }

    getSurname() {
        return this.surname;
    }

    getEmail() {
        return this.email;
    }

    getBirthdate() {
        return this.birthdate;
    }

    getCountry() {
        return this.country;
    }

    getLocation() {
        return this.location;
    }

    getRol() {
        return this.rol;
    }

    getImageBase64() {
        return this.imageBase64;
    }

    getImageType() {
        return this.imageType;
    }

    getDescription() {
        return this.description;
    }

    getToken() {
        return this.token;
    }

    setToken(token) {
        this.token = token;
    }

    getPassword() {
        return this.password;
    }

    setPassword(password) {
        this.password = password;
    }

    deletePassword() {
        this.password = null;
    }

    setTeam(team) {
        this.teams.push(team);
    }

    /**
     * Method that validates if an User can be created
     */
    isValidForCreate() {
        let errors = {};
        let hasErrors = false;
        const today = new Date();
        const tomorrow = new Date(today);
        const yesterday = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1);
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.username == null) {
            errors["userNameNull"] = "Username cannot be null";
            hasErrors = true;
        } else if (this.username.length < 4) {
            errors["userNameMinLength"] = "Username cannot have less than 4 characters";
            hasErrors = true;
        } else if (this.username.length > 20) {
            errors["userNameMaxLength"] = "Username cannot have more than 20 characters";
            hasErrors = true;
        }

        if (!this.validateEmail(this.email)) {
            errors["emailIncorrect"] = "Incorrect email";
            hasErrors = true;
        } else if (this.email.length > 100) {
            errors["userEmailMaxLength"] = "Email cannot have more than 100 characters";
            hasErrors = true;
        }

        let fechaSubstring = this.birthdate.substring(0, 10);
        let fechaSplit = fechaSubstring.split("-");
        if (this.birthdate == null) {
            errors["birthdateNull"] = "Birthdate cannot be null";
            hasErrors = true;
        } else if (new Date(this.birthdate) > new Date()) {
            errors["birthdateIncorrect"] = "Incorrect birthdate";
            hasErrors = true;
        } else if (new Date(parseInt(fechaSplit[0])+18, parseInt(fechaSplit[1])-1, parseInt(fechaSplit[2])) > new Date()) {
            errors["birthdate18orLessYearsOld"] = "You must be at least 18 years old";
            hasErrors = true;
        }

        if (hasErrors) {
            throw new NotValidException(errors);
        }
    }

    /**
     * Method that validates if an User can be updated
     */
    isValidForUpdate() {
        let errors = {};
        let hasErrors = false;
        const today = new Date();
        const tomorrow = new Date(today);
        const yesterday = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1);
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.name === null) { }
        else if (this.name.length > 20) {
            errors["nameMaxLength"] = "Name cannot have more than 20 characters";
            hasErrors = true;
        } else if (this.name.length < 1) {
            errors["nameMinLength"] = "Name cannot be empty";
            hasErrors = true;
        }

        if (this.surname === null) { }
        else if (this.surname.length > 20) {
            errors["userSurnameMaxLength"] = "Surname cannot have more than 20 characters";
            hasErrors = true;
        } else if (this.surname.length < 1) {
            errors["userSurnameMinLength"] = "Surname cannot be empty";
            hasErrors = true;
        }

        if (this.country === null) { }
        else if (this.country.length > 20) {
            errors["userCountryMaxLength"] = "Country cannot have more than 20 characters";
            hasErrors = true;
        } else if (this.country.length < 1) {
            errors["userCountryMinLength"] = "Country cannot be empty";
            hasErrors = true;
        }

        if (this.location === null) { }
        else if (this.location.length > 255) {
            errors["userLocationMaxLength"] = "Location cannot have more than 255 characters";
            hasErrors = true;
        } else if (this.location.length < 1) {
            errors["userLocationMinLength"] = "Location cannot be empty";
            hasErrors = true;
        }

        let fechaSubstring = this.birthdate.substring(0, 10);
        let fechaSplit = fechaSubstring.split("-");
        if (this.birthdate == null) {
            errors["birthdateNull"] = "Birthdate cannot be null";
            hasErrors = true;
        } else if (new Date(this.birthdate) > new Date()) {
            errors["birthdateIncorrect"] = "Incorrect birthdate";
            hasErrors = true;
        } else if (new Date(parseInt(fechaSplit[0])+18, parseInt(fechaSplit[1])-1, parseInt(fechaSplit[2])) > new Date()) {
            errors["birthdate18orLessYearsOld"] = "You must be at least 18 years old";
            hasErrors = true;
        }

        if (this.description === null) { }
        else if (this.description.length > 512) {
            errors["descriptionMaxLength"] = "Description cannot have more than 512 characters";
            hasErrors = true;
        } else if (this.description.length < 1) {
            errors["descriptionMinLength"] = "Description cannot be empty";
            hasErrors = true;
        }

        if (hasErrors) {
            throw new NotValidException(errors);
        }
    }

    /**
     * Method that validates if an email meets the following regular expression
     * @param {String} email
     */
    validateEmail(email) {
        const rexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return rexp.test(email);
    }
}
module.exports = User;