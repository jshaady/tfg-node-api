// NewsMapper.js

import InternalErrorException from "../models/InternalErrorException.js";
import { pool as connection } from "../core/dbconnection.js";

export default class NewsMapper {
  /**
   * Constructs News Mapper.
   * @constructor
   */
  constructor() {}

  /**
   * Get the latest news
   * @param {String} location news location
   * @param {String} page the current page
   * @returns {JSON} total number of news and the news array
   */
  async getNews(location, page) {
    try {
      const [countNews] = await connection.query(
        "SELECT COUNT(*) as count FROM news WHERE " +
          (location === "no"
            ? "location = ?"
            : "location = ? OR location LIKE ?"),
        location === "no" ? ["general"] : ["general", "%" + location + "%"]
      );
      const [news] = await connection.query(
        "SELECT * FROM news WHERE " +
          (location === "no"
            ? "location = ?"
            : "location = ? OR location LIKE ?") +
          " ORDER BY date DESC LIMIT " +
          page * 10,
        location === "no" ? ["general"] : ["general", "%" + location + "%"]
      );
      return {
        countNews: countNews[0].count,
        news: news,
      };
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }

  /**
   * Save a news
   * @param {JSON} news news data
   */
  async createNews(news) {
    try {
      await connection.query("INSERT INTO news SET ?", [news]);
      return;
    } catch (e) {
      throw new InternalErrorException("Internal error");
    }
  }
}
