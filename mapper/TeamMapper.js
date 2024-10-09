// TeamMapper.js

import InternalErrorException from "../models/InternalErrorException.js";
import User from "../models/User.js";
import { pool as connection } from "../core/dbconnection.js";

export default class TeamMapper {
  /**
   * Constructs Team Mapper.
   * @constructor
   */
  constructor() {}

  /**
   * Save a team into database and save team users
   * @param {JSON} teamInsert team data
   * @param {JSON} teamUserInsert team user data
   */
  async createTeam(teamInsert, teamUserInsert) {
    try {
      await connection.query("INSERT INTO teams SET ?", [teamInsert]);
      await connection.query("INSERT INTO teamusers SET ?", [teamUserInsert]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Modify the data of a team
   * @param {JSON} updateTeam team data
   * @param {Team} team team object
   */
  async editTeam(updateTeam, team) {
    try {
      await connection.query("UPDATE teams SET ? WHERE teamname = ?", [
        updateTeam,
        team.getTeamname(),
      ]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Modify the image of a team
   * @param {JSON} updateTeamImage team image data
   * @param {String} teamname team name
   */
  async editTeamImage(updateTeamImage, teamname) {
    try {
      await connection.query("UPDATE teams SET ? WHERE teamname = ?", [
        updateTeamImage,
        teamname,
      ]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get a team
   * @param {String} teamname team name
   * @returns {Array} team
   */
  async getTeam(teamname) {
    try {
      const [team] = await connection.query(
        "SELECT * FROM teams WHERE teamname = ?",
        [teamname]
      );
      return team;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get a team with the users
   * @param {String} teamname team name
   * @returns {Array} team
   */
  async getTeamWithUsers(teamname) {
    try {
      const [team] = await connection.query(
        "SELECT * FROM teams JOIN teamusers WHERE teams.teamname = teamusers.teamname AND teams.teamname = ?",
        [teamname]
      );
      return team;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get teams that user belong to
   * @param {String} username user name
   * @returns {Array} teams
   */
  async getMyTeams(username) {
    try {
      const [teams] = await connection.query(
        "SELECT * FROM teamusers tu JOIN teams t WHERE tu.teamname = t.teamname && tu.username=?",
        [username]
      );
      return teams;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get user-created teams
   * @param {String} username user name
   * @returns {Array} teams
   */
  async getMyTeamsCreated(username) {
    try {
      const [teams] = await connection.query(
        "SELECT DISTINCT t.teamname FROM teams t JOIN teamusers u WHERE t.teamname = u.teamname AND t.userleader = ?",
        [username]
      );
      return teams;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the players of a team
   * @param {Team} team team Object
   * @returns {Array} team
   */
  async usersInTeam(team) {
    try {
      const [users] = await connection.query(
        "SELECT * FROM teamusers WHERE teamname = ?",
        [team.getTeamname()]
      );
      users.forEach((user) => {
        team.setUserInTeam(
          new User(
            user.username,
            user.name,
            user.surname,
            user.email,
            user.birthdate,
            user.country,
            user.province,
            user.address,
            user.phone,
            user.rol,
            user.joinDate,
            user.base64Avatar,
            user.imagetype
          )
        );
      });
      return team;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the players of a team
   * @param {String} uuid identification uuid code
   * @returns {Array} team
   */
  async searchByUuid(uuid) {
    try {
      const [team] = await connection.query(
        "SELECT * FROM teams WHERE uuid = ?",
        [uuid]
      );
      return team;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get a team by his uuid code
   * @param {String} teamname team name
   * @param {String} userName user name
   * @returns {String} uuid
   */
  async getTeamUuid(teamname, userName) {
    try {
      const [uuid] = await connection.query(
        "SELECT uuid FROM teams WHERE teamname = ? AND userleader = ?",
        [teamname, userName]
      );
      return uuid;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Save a team user
   * @param {JSON} insertUserInTeam team user data
   */
  async join(insertUserInTeam) {
    try {
      await connection.query("INSERT INTO teamusers SET ?", [insertUserInTeam]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Delete a team user
   * @param {String} teamname team name
   * @param {String} username user name
   */
  async left(teamname, username) {
    try {
      await connection.query(
        "DELETE FROM teamusers WHERE username = ? && teamname = ?",
        [username, teamname]
      );
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the games played by a team
   * @param {String} teamname team name
   * @returns {Array} matches
   */
  async getMatchesPlayed(teamname) {
    try {
      const [matches] = await connection.query(
        "SELECT * FROM matches WHERE (team1 = ? OR team2 = ?) AND matchresult1 IS NOT NULL ORDER BY matchdate DESC",
        [teamname, teamname]
      );
      return matches;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the championships played
   * @param {String} teamname team name
   * @returns {JSON} leagues played, tournaments played, matches played, matches won
   */
  async getChampionshipPlayed(teamname) {
    try {
      const [leaguePlayed] = await connection.query(
        'SELECT COUNT(DISTINCT idchampionship) as leaguePlayed FROM matches WHERE (team1 = ? OR team2 = ?) AND type = "League"',
        [teamname, teamname]
      );
      const [tournamentPlayed] = await connection.query(
        'SELECT COUNT(DISTINCT idchampionship) as tournamentPlayed FROM matches WHERE (team1 = ? OR team2 = ?) AND type = "Tournament"',
        [teamname, teamname]
      );
      const [matchesPlayed] = await connection.query(
        "SELECT COUNT(*) as matchesPlayed FROM matches WHERE (team1 = ? OR team2 = ?) AND matchresult1 IS NOT NULL",
        [teamname, teamname]
      );
      const [matchesWon] = await connection.query(
        "SELECT COUNT(*) as matchesWon FROM matches WHERE ((team1 = ? AND matchresult1 > matchresult2) OR " +
          "(team2 = ? AND matchresult2 > matchresult1)) AND matchresult1 IS NOT NULL",
        [teamname, teamname]
      );
      return {
        leaguesPlayed: leaguePlayed[0].leaguePlayed,
        tournamentsPlayed: tournamentPlayed[0].tournamentPlayed,
        matchesplayed: matchesPlayed[0].matchesPlayed,
        matchesWon: matchesWon[0].matchesWon,
      };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Check if a user is in team
   * @param {String} teamname team name
   * @param {String} userName user name
   * @returns {JSON} is in team boolean, number of players, team
   */
  async isInTeam(teamname, userName) {
    try {
      const [isInTeam] = await connection.query(
        "SELECT * FROM teamusers WHERE username = ? AND teamname = ?",
        [userName, teamname]
      );
      const [numberOfPlayers] = await connection.query(
        "SELECT COUNT(*) as totalplayers FROM teamusers WHERE teamname = ?",
        [teamname]
      );
      const [team] = await connection.query(
        "SELECT * FROM teams WHERE teamname = ?",
        [teamname]
      );
      return {
        isInTeam: isInTeam,
        numberOfPlayers: numberOfPlayers,
        team: team,
      };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Check if a user is in team
   * @param {String} teamname team name
   * @param {String} location team location
   * @param {String} username user name
   * @returns {Array} team
   */
  async search(teamname, location, username) {
    let teamsRes;
    try {
      if (teamname !== "null" && location !== "null") {
        const [teams] = await connection.query(
          "SELECT * FROM teams WHERE teamname LIKE ? AND location LIKE ? AND userleader != ?",
          ["%" + teamname + "%", "%" + location + "%", username]
        );
        teamsRes = teams;
      } else if (teamname !== "null" && location === "null") {
        const [teams] = await connection.query(
          "SELECT * FROM teams WHERE teamname LIKE ? AND userleader != ?",
          ["%" + teamname + "%", username]
        );
        teamsRes = teams;
      } else if (teamname === "null" && location !== "null") {
        const [teams] = await connection.query(
          "SELECT * FROM teams WHERE location LIKE ? AND userleader != ?",
          ["%" + location + "%", username]
        );
        teamsRes = teams;
      } else {
        teamsRes = [];
      }
      return teamsRes;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the teams you play on
   * @param {String} username user name
   * @returns {Array} teams
   */
  async getTeamsJoined(username) {
    try {
      const [teamsJoined] = await connection.query(
        "SELECT * FROM teams t JOIN teamusers u WHERE t.teamname = u.teamname AND u.username = ?",
        [username]
      );
      return teamsJoined;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }
}
