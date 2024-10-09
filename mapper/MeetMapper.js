// MeetMapper.js

import InternalErrorException from "../models/InternalErrorException.js";
import { pool as connection } from "../core/dbconnection.js";

export default class MeetMapper {
  /**
   * Constructs Meet Mapper.
   * @constructor
   */
  constructor() {}

  /**
   * Save a new meet into database
   * @param {JSON} meet meet data
   */
  async createMeet(meet) {
    try {
      const [create] = await connection.query("INSERT INTO meets SET ?", [
        meet,
      ]);
      return create;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get a meet
   * @param {String} id meet identifier
   * @returns {JSON} meet data and meet users
   */
  async getMeet(id) {
    try {
      const [meet] = await connection.query(
        "SELECT * FROM meets WHERE id = ?",
        [id]
      );
      const [users] = await connection.query(
        "SELECT * FROM meetusers m JOIN users u WHERE m.username = u.username && idmeet = ?",
        [id]
      );
      return { meet: meet, users: users };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get meets filter by location
   * @param {String} location meet location
   * @param {Date} date meet date
   * @param {String} pageIndex Pagination data, current page
   * @param {String} pageSize pagination data, number of matches for page
   * @returns {JSON} number of total meets for this location and meets array
   */
  async getMeets(location, pageIndex, pageSize, date) {
    try {
      const [count] = await connection.query(
        "SELECT COUNT(*) AS count FROM meets WHERE location = ? && ? < date",
        [location, date]
      );

      const offsetValue = pageIndex === 0 ? 0 : pageIndex * pageSize - 1;
      const limit =
        count[0].count - offsetValue < pageSize && offsetValue > 0
          ? count[0].count - pageSize
          : pageSize;

      const [meets] = await connection.query(
        "SELECT id, name, usercreator, sport, description, location, date, " +
          "(SELECT COUNT(*) FROM meetusers WHERE idmeet = id) as participants FROM meets WHERE location = ? && ? < date ORDER BY date LIMIT ? OFFSET ?",
        [location, date, limit, offsetValue]
      );

      return {
        totalMeets: count[0].count,
        meets: meets,
      };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Save a meet user
   * @param {JSON} meetJoin meet join data
   */
  async joinMeet(meetJoin) {
    try {
      await connection.query("INSERT INTO meetusers SET ?", [meetJoin]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Delete a meet user
   * @param {String} username user name
   * @param {String} idMeet meet identifier
   */
  async leftMeet(username, idMeet) {
    try {
      await connection.query(
        "DELETE FROM meetusers WHERE username = ? && idmeet = ?",
        [username, idMeet]
      );
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Check if a user participate in a meet
   * @param {String} username user name
   * @param {String} idMeet meet identifier
   * @returns {JSON} meet and user name in meet, only data exists
   */
  async existsInMeetUsers(username, idMeet) {
    try {
      const [meet] = await connection.query(
        "SELECT * FROM meets WHERE id = ?",
        [idMeet]
      );
      const [userInMeet] = await connection.query(
        "SELECT * FROM meetusers WHERE username = ? && idmeet = ?",
        [username, idMeet]
      );
      return { meet: meet, userInMeet: userInMeet };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Set the number of total participants in the meet
   * @param {Meet} meet meet dobject
   */
  async usersInMeet(meet) {
    try {
      const [usersInMeet] = await connection.query(
        "SELECT COUNT(*) AS number FROM meetusers WHERE idmeet = ?",
        [meet.getId()]
      );
      meet.setParticipants(usersInMeet[0].number);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Get the next meetups a user is enrolled in
   * @param {String} username meet dobject
   * @param {Date} date the current date
   * @param {String} page the current page
   * @returns meets
   */
  async getUserNextMeets(username, date, page) {
    try {
      const [meets] = await connection.query(
        "SELECT * FROM meets m LEFT JOIN meetusers mu ON m.id = mu.idmeet WHERE mu.username = ? " +
          "AND ? < m.date ORDER BY m.date LIMIT ? OFFSET ?",
        [username, date, 5, 5 * page]
      );
      return meets;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }
}
