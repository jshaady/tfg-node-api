import NotValidException from "./NotValidException.js";

export default class News {
  /**
   * Constructs News.
   * @constructor
   * @param {String} sendUser: Username of the person who publishes the news.
   * @param {String} title: News title.
   * @param {String} message: News message.
   * @param {String} date: News publication date.
   * @param {String} location: News publication location.
   * @param {String} imageBase64: News image, saved on base 64.
   * @param {String} imageType: News image type (jpg, png).
   */
  constructor(
    sendUser = null,
    title = null,
    message = null,
    date = null,
    location = null,
    imageBase64 = null,
    imageType = null
  ) {
    this.sendUser = sendUser ? sendUser.trim() : null;
    this.title = title ? title.trim() : null;
    this.message = message ? message.trim() : null;
    this.location = location ? location.trim() : null;
    this.date = date;
    this.imageBase64 = imageBase64;
    this.imageType = imageType;
  }

  getSendUser() {
    return this.sendUser;
  }

  getTitle() {
    return this.title;
  }

  getMessage() {
    return this.message;
  }

  getImage() {
    return this.image;
  }

  getDate() {
    return this.date;
  }

  getLocation() {
    return this.location;
  }

  getImageBase64() {
    return this.imageBase64;
  }

  getImageType() {
    return this.imageType;
  }

  setUser(user) {
    this.sendUser = user;
  }

  /**
   * Method that validates if a News can be created
   */
  isValidForCreate() {
    let errors = {};
    let hasErrors = false;
    if (this.sendUser.length === null) {
      errors["sendUserNull"] = "Send user cannot be null";
      hasErrors = true;
    } else if (this.sendUser.length < 1) {
      errors["sendUserMinLength"] = "The sending user cannot be empty";
      hasErrors = true;
    } else if (this.sendUser.length > 20) {
      errors["sendUserMaxLength"] =
        "Send user cant contain more than 20 characterers";
      hasErrors = true;
    }

    if (this.title === null) {
      errors["titleNull"] = "The title cannot be null";
      hasErrors = true;
    } else if (this.title.length < 1) {
      errors["titleMinLength"] = "The title name cannot be empty";
      hasErrors = true;
    } else if (this.title.length > 60) {
      errors["titleMaxLength"] = "Title cant contain more than 60 characterers";
      hasErrors = true;
    }

    if (this.message === null) {
      errors["messageNull"] = "The message cannot be null";
      hasErrors = true;
    } else if (this.message.length < 1) {
      errors["messageMinLength"] = "The message cannot be empty";
      hasErrors = true;
    } else if (this.message.length > 65535) {
      errors["messageMinLength"] =
        "Message cannot contain more than 65535 characterers";
      hasErrors = true;
    }

    if (this.location === null) {
      errors["locationNull"] = "The location cannot be null";
      hasErrors = true;
    } else if (this.location.length < 1) {
      errors["locationMinLength"] = "The location cannot be empty";
      hasErrors = true;
    } else if (this.location.length > 255) {
      errors["locationMaxLength"] =
        "Location cannot contain more than 255 characterers";
      hasErrors = true;
    }

    if (hasErrors) {
      throw new NotValidException(errors);
    }
  }
}
