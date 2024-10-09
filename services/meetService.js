import dateFormat from "dateformat";
import paginate from "jw-paginate";

import NotFoundException from "../models/NotFoundException.js";
import ConflictException from "../models/ConflictException.js";

import Meet from "../models/Meet.js";
import User from "../models/User.js";

import MeetMapper from "../mapper/MeetMapper.js";
const meetMapper = new MeetMapper();

export default class MeetService {
  /**
   * Constructs Meet Service.
   * @constructor
   */
  constructor() {}

  /**
   * Create a meet
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} Confirmation message
   */
  async createMeet(req) {
    const meet = new Meet(
      null,
      req.body.name,
      req.username,
      req.body.date,
      req.body.sport,
      req.body.description,
      req.body.location
    );
    try {
      meet.isValidForCreate();
    } catch (e) {
      throw new ConflictException("Incorrect data", e.getErrors());
    }
    const meetInsert = {
      usercreator: meet.getUserCretor(),
      name: meet.getName(),
      description: meet.getDescription(),
      sport: meet.getSport(),
      location: meet.getLocation(),
      date: meet.getDate(),
    };
    const created = await meetMapper.createMeet(meetInsert);
    return { message: "Meet created successfully", id: created.insertId };
  }

  /**
   * Get a meet
   * @param  {HttpRequest} req - Request from client
   * @return  {Meet} Meet
   */
  async getMeet(req) {
    const meetData = await meetMapper.getMeet(req.query.id);
    if (meetData.meet.length === 0) {
      return new NotFoundException("Meet not found");
    } else {
      const usersInMeet = [];
      if (meetData.users.length > 0) {
        meetData.users.forEach((user) => {
          usersInMeet.push(
            new User(
              user.username,
              user.name,
              user.surname,
              null,
              null,
              null,
              null,
              null,
              user.imagebase64,
              user.imagetype,
              null
            )
          );
        });
      }
      const meet = new Meet(
        meetData.meet[0].id,
        meetData.meet[0].name,
        meetData.meet[0].usercreator,
        meetData.meet[0].date,
        meetData.meet[0].sport,
        meetData.meet[0].description,
        meetData.meet[0].location
      );
      meet.setUsersInMeet(usersInMeet);
      return meet;
    }
  }

  /**
   * Get meets filtered by location
   * @param  {HttpRequest} req - Request from client
   * @return  {Meet} Meets
   */
  async getMeets(req) {
    const page =
      parseInt(req.query.pageIndex) < 0 ? 0 : parseInt(req.query.pageIndex);
    const meetsFromMapper = await meetMapper.getMeets(
      req.query.location,
      page,
      parseInt(req.query.pageSize),
      dateFormat(req.query.date, "yyyy-mm-dd HH:mm")
    );
    if (meetsFromMapper.totalMeets === 0) {
      return [];
    } else {
      const meets = [];
      meetsFromMapper.meets.forEach((meet) => {
        let meetDate = dateFormat(meet.date, "dd-mm-yyyy HH:MM");
        let meetSave = new Meet(
          meet.id,
          meet.name,
          meet.usercreator,
          meetDate,
          meet.sport,
          meet.description,
          meet.location
        );
        meetSave.setParticipants(meet.participants);
        meets.push(meetSave);
      });

      const pager = paginate(
        meetsFromMapper.totalMeets,
        parseInt(req.query.pageIndex),
        parseInt(req.query.pageSize)
      );

      return { pager, meets };
    }
  }

  /**
   * Join a meet
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async joinMeet(req) {
    const existsData = await meetMapper.existsInMeetUsers(
      req.username,
      req.body.idMeet
    );
    if (existsData.meet.length === 0) {
      throw new NotFoundException("Meet not found");
    } else if (existsData.userInMeet.length !== 0) {
      throw new ConflictException("Already in meet");
    } else {
      let meetJoin = {
        idmeet: req.body.idMeet,
        username: req.username,
      };
      await meetMapper.joinMeet(meetJoin);
      return "Joined successfully";
    }
  }

  /**
   * Left a meet
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async leftMeet(req) {
    const existsData = await meetMapper.existsInMeetUsers(
      req.username,
      req.query.idMeet
    );
    if (existsData.meet.length === 0) {
      return new NotFoundException("Meet not found");
    } else if (existsData.userInMeet === 0) {
      return new ConflictException("You not in the meet");
    } else {
      await meetMapper.leftMeet(req.username, req.query.idMeet);
      return "Left successfully";
    }
  }
}
