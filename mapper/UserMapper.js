// UserMapper.js

import InternalErrorException from "../models/InternalErrorException.js";
import User from "../models/User.js";
import { pool as connection } from "../core/dbconnection.js";

export default class UserMapper {
  /**
   * Constructs User Mapper.
   * @constructor
   */
  constructor() {}

  /**
   * Get a user
   * @param {String} username user name
   * @returns User object
   */
  async getUser(username) {
    try {
      const [user] = await connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      return user;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get a user with his teams
   * @param {String} username user name
   * @returns {JSON} user and teams array
   */
  async getUserWithTeams(username) {
    try {
      const [user] = await connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      const [teams] = await connection.query(
        "SELECT * FROM teamusers tu inner JOIN teams t WHERE tu.teamname = t.teamname AND tu.username = ?",
        [username]
      );
      return {
        user: user,
        teams: teams,
      };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Delete a user
   * @param {String} username user name
   */
  async delete(username) {
    try {
      await connection.query("DELETE FROM users WHERE username = ?", [
        username,
      ]);
      return;
    } catch (e) {
      console.log(e);
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get a user with image data
   * @param {String} username user name
   * @returns {User} user
   */
  async getUserWithImage(username) {
    try {
      const [user] = await connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      return new User(
        user[0].username,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        user[0].imagebase64,
        user[0].imagetype,
        null
      );
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get a user by email
   * @param {String} email user email
   * @returns {Array} user
   */
  async getUserByEmail(email) {
    try {
      const [user] = await connection.query(
        "SELECT * FROM users WHERE  email = ?",
        [email]
      );
      return user;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Check if a user exists
   * @param {user} user user object
   * @returns {Array} user
   */
  async checkUserExists(user) {
    try {
      const [userValid] = await connection.query(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [user.getUsername(), user.getEmail()]
      );
      return userValid;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Save a user into database
   * @param {JSON} user user data
   */
  async createUser(user) {
    try {
      await connection.query("INSERT INTO users SET ?", [user]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Verify a user email
   * @param {String} username user name
   */
  async confirmation(username) {
    try {
      await connection.query("UPDATE users SET ? WHERE username = ?", [
        { confirmed: 1 },
        username,
      ]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the users with whom you have messages
   * @param {String} username user name
   * @returns {Array} users
   */
  async getChatUsernames(username) {
    try {
      const [users] = await connection.query(
        "SELECT sendUser, targetUser " +
          "FROM messages WHERE targetUser = ? OR sendUser = ? ORDER BY senddate DESC",
        [username, username]
      );
      return users;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get a username for the chat
   * @param {String} username user name
   * @return {User} user
   */
  async getChatUser(username) {
    try {
      const [user] = await connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      return new User(
        user[0].username,
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        user[0].imagebase64,
        user[0].imagetype,
        null
      );
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Update user data
   * @param {JSON} userUpdate user data
   * @param {String} username user name
   */
  async updateUser(userUpdate, username) {
    try {
      await connection.query("UPDATE users SET ? WHERE username = ?", [
        userUpdate,
        username,
      ]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Update user image
   * @param {JSON} userUpdate user data
   * @param {String} username user name
   */
  async updateProfileAvatar(imageData, username) {
    try {
      await connection.query("UPDATE users SET ? WHERE username = ?", [
        imageData,
        username,
      ]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the user list
   * @param {String} pageIndex pagination data, current page
   * @param {String} pageSize pagination data, number of users per page
   * @param {String} nameOrEmail filter name or email
   * @returns {JSON} number of total users and users
   */
  async getUsersList(pageIndex, pageSize, nameOrEmail) {
    try {
      const queryParameters =
        nameOrEmail !== "null"
          ? ["%" + nameOrEmail + "%", "%" + nameOrEmail + "%"]
          : [];

      const countQuery =
        "SELECT COUNT(*) AS count FROM users" +
        (nameOrEmail !== "null"
          ? " WHERE username LIKE ? OR email LIKE ?"
          : "");
      const [count] = await connection.query(countQuery, queryParameters);

      const offsetValue = pageIndex === 0 ? 0 : pageIndex * pageSize - 1;
      const limit =
        count[0].count - offsetValue < pageSize && offsetValue > 0
          ? count[0].count - pageSize
          : pageSize;

      const usersQuery =
        "SELECT * FROM users " +
        (nameOrEmail !== "null"
          ? "WHERE username LIKE ? OR email LIKE ? "
          : "") +
        "ORDER BY username LIMIT " +
        limit +
        " OFFSET " +
        offsetValue;
      const [users] = await connection.query(usersQuery, queryParameters);

      return {
        totalUsers: count[0].count,
        users: users,
      };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the statistics of a user
   * @param {String} username user name
   * @param {String} sport name sport
   * @returns {JSON} leagues played, tournaments played, matches played and matches won
   */
  async getStats(username, sport) {
    try {
      const [leaguePlayed] = await connection.query(
        "SELECT COUNT(DISTINCT c.id) AS leaguePlayed FROM teamusers tu JOIN teams t JOIN matches m JOIN championships c WHERE tu.username = ? " +
          "AND tu.teamname = t.teamname AND (t.teamname = m.team1 OR t.teamname = m.team2) AND m.matchresult1 IS NOT NULL " +
          "AND m.type = ? AND c.id = m.idchampionship AND c.sport = ?",
        [username, "League", sport]
      );

      const [tournamentPlayed] = await connection.query(
        "SELECT COUNT(DISTINCT c.id) AS tournamentPlayed FROM teamusers tu JOIN teams t JOIN matches m JOIN championships c WHERE tu.username = ? " +
          "AND tu.teamname = t.teamname AND (t.teamname = m.team1 OR t.teamname = m.team2) AND m.matchresult1 IS NOT NULL " +
          "AND m.type = ? AND c.id = m.idchampionship AND c.sport = ?",
        [username, "Tournament", sport]
      );

      const [matchesPlayed] = await connection.query(
        "SELECT COUNT(username) AS matchesPlayed FROM teamusers tu JOIN teams t JOIN matches m JOIN championships c WHERE tu.username = ? AND tu.teamname = t.teamname " +
          "AND (t.teamname = m.team1 OR t.teamname = m.team2) AND c.id = m.idchampionship AND c.sport = ? AND m.matchresult1 IS NOT NULL",
        [username, sport]
      );

      const [matchesWon] = await connection.query(
        "SELECT COUNT(username) AS matchesWon FROM teamusers tu JOIN teams t JOIN matches m JOIN championships c WHERE tu.username = ? AND tu.teamname = t.teamname AND " +
          "(t.teamname = m.team1 OR t.teamname = m.team2) AND c.id = m.idchampionship AND c.sport = ? AND m.matchresult1 IS NOT NULL AND " +
          "((t.teamname = m.team1 AND m.matchresult1 > m.matchresult2) OR (t.teamname = m.team2 AND m.matchresult2 > m.matchresult1))",
        [username, sport]
      );
      return {
        leaguesPlayed: leaguePlayed[0].leaguePlayed,
        tournamentsPlayed: tournamentPlayed[0].tournamentPlayed,
        matchesPlayed: matchesPlayed[0].matchesPlayed,
        matchesWon: matchesWon[0].matchesWon,
      };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the games played by a user
   * @param {String} username user name
   * @param {String} pageIndex pagination data, current page
   * @param {String} pageSize pagination data, number of users per page
   * @param {String} sport match sport type
   * @returns {Array} matches
   */
  async getMatchesPlayed(username, pageIndex, pageSize, sport) {
    try {
      const [count] = await connection.query(
        "SELECT COUNT(*) as count FROM teamusers tu JOIN teams t JOIN matches m JOIN championships c WHERE tu.username = ? " +
          "AND tu.teamname = t.teamname AND (t.teamname = m.team1 OR t.teamname = m.team2) AND m.matchresult1 IS NOT NULL " +
          "AND m.idchampionship = c.id AND c.sport = ?",
        [username, sport]
      );
      const offsetValue = pageIndex === 0 ? 0 : pageIndex * pageSize - 1;
      const limit =
        count[0].count - offsetValue < pageSize && offsetValue > 0
          ? count[0].count - pageSize
          : pageSize;

      const [matches] = await connection.query(
        "SELECT m.idchampionship, m.phase, m.type, m.matchdate, m.team1, m.team2, m.matchresult1, m.matchresult2, m.position " +
          "FROM teamusers tu JOIN teams t JOIN matches m JOIN championships c WHERE tu.username = ? " +
          "AND tu.teamname = t.teamname AND (t.teamname = m.team1 OR t.teamname = m.team2) AND m.matchresult1 IS NOT NULL " +
          "AND m.idchampionship = c.id AND c.sport = ? ORDER BY m.matchdate DESC  LIMIT " +
          limit +
          " OFFSET " +
          offsetValue,
        [username, sport]
      );
      return matches;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Set in news objects the users who sent it
   * @param {News} news news object
   */
  async newsUser(news) {
    try {
      const [user] = await connection.query(
        "SELECT * FROM users WHERE username = ?",
        [news.getSendUser()]
      );
      news.setUser(
        new User(
          user[0].username,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          user[0].imagebase64,
          user[0].imagetype,
          null
        )
      );
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }
}
