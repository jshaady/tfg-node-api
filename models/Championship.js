import NotValidException from "./NotValidException.js";

export default class Championship {
  /**
   * Constructs Match.
   * @constructor
   * @param {Number} id: Championship id.
   * @param {String} championshipName: Championship name.
   * @param {String} creatorUser: Championship creator username.
   * @param {String} numMaxTeams: Maximum number of teams in the championship.
   * @param {String} startInscription: Championship start inscription date.
   * @param {String} endInscription: Championship end inscription date.
   * @param {String} startChampionship: Championship start date.
   * @param {String} location: Championship location.
   * @param {String} sport: Championship sport.
   * @param {String} type: Championship type (League or Tournament).
   * @param {String} state: Cahmpionship state (Inscription, In Progress, Finished).
   * @param {String} phase: Championship phase, only used in tournaments.
   * @param {String} description: Championship description.
   */
  constructor(
    id = null,
    championshipName = null,
    creatorUser = null,
    numMaxTeams = null,
    startInscription = null,
    endInscription = null,
    startChampionship = null,
    location = null,
    sport = null,
    type = null,
    state = null,
    phase = null,
    description = null
  ) {
    this.id = id;
    this.championshipName = championshipName ? championshipName.trim() : null;
    this.creatorUser = creatorUser ? creatorUser.trim() : null;
    this.description = description ? description.trim() : null;
    this.location = location ? location.trim() : null;
    this.sport = sport ? sport.trim() : null;
    this.numMaxTeams = numMaxTeams;
    this.startInscription = startInscription;
    this.endInscription = endInscription;
    this.startChampionship = startChampionship;
    this.type = type;
    this.state = state;
    this.teamsInChampionship = [];
    this.phase = phase;
  }

  getId() {
    return this.id;
  }

  getChampionshipName() {
    return this.championshipName;
  }

  getCreatorUser() {
    return this.creatorUser;
  }

  getNumMaxTeams() {
    return this.numMaxTeams;
  }

  getStartInscription() {
    return this.startInscription;
  }

  getEndInscription() {
    return this.endInscription;
  }

  getStartChampionship() {
    return this.startChampionship;
  }

  getLocation() {
    return this.location;
  }

  getSport() {
    return this.sport;
  }

  getCreatorUser() {
    return this.creatorUser;
  }

  getState() {
    return this.state;
  }

  getType() {
    return this.type;
  }

  getDescription() {
    return this.description;
  }

  setTeamInChampionship(team) {
    this.teamsInChampionship.push(team);
  }

  getTeamInChampionship() {
    return this.teamsInChampionship;
  }

  getPhase() {
    return this.phase;
  }

  /**
   * Method that validates if a Cahmpionship can be created
   */
  isValidForCreate() {
    let errors = {};
    let hasErrors = false;
    const startInscription = new Date(this.startInscription);
    const endInscription = new Date(this.endInscription);
    const startChampionship = new Date(this.startChampionship);
    const today = new Date();
    const tomorrow = new Date(today);
    const yesterday = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.championshipName === null) {
      errors["championshipNameNull"] = "Championship name cannot be null";
      hasErrors = true;
    } else if (this.championshipName.length < 5) {
      errors["championshipNameMinLength"] =
        "Tournament name cannot have less than 5 characters";
      hasErrors = true;
    } else if (this.championshipName.length > 60) {
      errors["championshipNameMaxLength"] =
        "Tournament name cannot have more than 60 characters";
      hasErrors = true;
    }

    if (this.userCreator === null) {
      errors["userCreatorNull"] = "User creator cannot be null";
      hasErrors = true;
    } else if (this.creatorUser.length < 5) {
      errors["userCreatorIncorrect"] = "Incorrect user creator";
      hasErrors = true;
    }

    if (this.type === null) {
      errors["typeNull"] = "Championship type cannot be null";
      hasErrors = true;
    } else if (this.type !== "League" && this.type !== "Tournament") {
      errors["incorrectType"] = "Incorrect type of championship";
      hasErrors = true;
    } else if (this.type === "League") {
      if (
        this.numMaxTeams != "4" &&
        this.numMaxTeams != "10" &&
        this.numMaxTeams != "20"
      ) {
        errors["numMaxTeamsIncorrect"] = "Incorrect maximum number of teams";
        hasErrors = true;
      }
    } else if (this.type === "Tournament") {
      if (
        this.numMaxTeams != "4" &&
        this.numMaxTeams != "8" &&
        this.numMaxTeams != "16" &&
        this.numMaxTeams != "32"
      ) {
        errors["numMaxTeamsIncorrect"] = "Incorrect maximum number of teams";
        hasErrors = true;
      }
    }

    if (this.sport === null) {
      errors["sportNull"] = "Sport cannot be null";
      hasErrors = true;
    } else if (this.sport.length > 35) {
      errors["sportsMaxLength"] = "Sport cannor have more than 35 characters";
    }

    if (this.description === null) {
      errors["descriptionNull"] = "Description cannot be null";
      hasErrors = true;
    } else if (this.description.length < 5) {
      errors["descriptionMinLength"] =
        "Description cannot have less than 5 characters";
      hasErrors = true;
    } else if (this.description.length > 512) {
      errors["descriptionMaxLength"] =
        "Description cannot have more than 512 characters";
      hasErrors = true;
    }

    if (this.location === null) {
      errors["championshipLocationNull"] = "Location cannot be null";
      hasErrors = true;
    } else if (this.location.length > 255) {
      errors["championshipLocationMaxLength"] =
        "Location cannot have more than 255 characters";
      hasErrors = true;
    } else if (this.location.length < 1) {
      errors["championshipLocationMinLength"] = "Location cannot be empty";
      hasErrors = true;
    }

    if (this.startInscription === null) {
      errors["startInscriptionNull"] = "Start inscription date cannot be null";
      hasErrors = true;
    } else if (startInscription > tomorrow || startInscription < yesterday) {
      errors["startInscriptionIncorrect"] =
        "Start inscription date is incorrect";
      hasErrors = true;
    }

    if (this.endInscription === null) {
      errors["endInscriptionNull"] = "End inscription date cannot be null";
      hasErrors = true;
    } else if (
      isNaN(endInscription.getTime()) ||
      endInscription <= startInscription
    ) {
      errors["endInscriptionIncorrect"] = "End inscription date is incorrect";
      hasErrors = true;
    }

    if (this.startChampionship === null) {
      errors["startChampionshipNull"] =
        "Start championship date cannot be null";
      hasErrors = true;
    } else if (
      isNaN(startChampionship.getTime()) ||
      startChampionship <= startInscription ||
      startChampionship <= endInscription
    ) {
      errors["startChampionshipIncorrect"] =
        "Start championship date is incorrect";
      hasErrors = true;
    }

    if (hasErrors) {
      throw new NotValidException(errors);
    }
  }
}
