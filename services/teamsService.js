import dateFormat from "dateformat";
import { v4 } from "uuid";

import NotFoundException from "../models/NotFoundException.js";
import ConflictException from "../models/ConflictException.js";

import TeamMapper from "../mapper/TeamMapper.js";
import UserMapper from "../mapper/UserMapper.js";
import Team from "../models/Team.js";
import Match from "../models/Match.js";
import User from "../models/User.js";

const teamMapper = new TeamMapper();
const userMapper = new UserMapper();

export default class TeamsService {
  /**
   * Constructs Team Service.
   * @constructor
   */
  constructor() {}

  /**
   * Create team
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async createTeam(req) {
    const team = new Team(
      req.body.teamname,
      req.username,
      req.body.description,
      req.body.date,
      req.body.location,
      null,
      null,
      req.body.isPrivate,
      null,
      req.body.maxNumberPlayers
    );
    const teamFromMapper = await teamMapper.getTeam(team.getTeamname());
    if (teamFromMapper.length > 0) {
      throw new ConflictException("Conflict data", {
        teamExists: "This team name already exists",
      });
    } else {
      try {
        team.isValidForCreate();
      } catch (e) {
        throw new ConflictException("Incorrect data", e.getErrors());
      }
      const teamInsert = {
        teamname: team.getTeamname().toString(),
        isprivate: parseInt(team.getIsPrivate(), 10),
        userleader: team.getUserLeader(),
        location: team.getLocation(),
        nummaxplayers: team.getMaxNumberPlayers(),
        description: team.getDescription(),
        createdate: team.getCreateDate(),
        uuid: v4(),
      };
      const teamUserInsert = {
        username: team.getUserLeader(),
        teamname: team.getTeamname(),
      };
      await teamMapper.createTeam(teamInsert, teamUserInsert);
      return { message: "Team created successfully", id: teamInsert.teamname };
    }
  }

  /**
   * Update team data
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async editTeam(req) {
    const team = new Team(
      req.body.teamname,
      null,
      req.body.description,
      null,
      req.body.location
    );
    const teamFromMapper = await teamMapper.getTeam(team.getTeamname());
    if (teamFromMapper.length === 0) {
      throw new ConflictException("Incorrect team name");
    } else if (teamFromMapper[0].userleader !== req.username) {
      throw new ConflictException(
        "You not the team leader, cant edit the info"
      );
    } else {
      try {
        team.isValidForUpdate();
      } catch (e) {
        throw new ConflictException("Incorrect data", e.getErrors());
      }
      const updateTeam = {
        description: team.getDescription(),
        location: team.getLocation(),
      };
      await teamMapper.editTeam(updateTeam, team);
      return "Team updated successfully";
    }
  }

  /**
   * Update team image
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async editTeamImage(req) {
    const team = await teamMapper.getTeam(req.body.teamname);
    if (team.length === 0) {
      throw new ConflictException("Incorrect team name");
    } else if (team[0].userleader !== req.username) {
      throw new ConflictException(
        "You not the team leader, cant edit the info"
      );
    } else {
      const updateTeamImage = {
        imagebase64: req.body.value,
        imagetype: req.body.filetype,
      };
      await teamMapper.editTeamImage(updateTeamImage, team[0].teamname);
      return "Team image updated successfully";
    }
  }

  /**
   * Get team
   * @param  {HttpRequest} req - Request from client
   * @return  {Team} Team object
   */
  async getTeam(req) {
    const teamFromMapper = await teamMapper.getTeamWithUsers(
      req.query.teamname
    );
    if (teamFromMapper.length < 1) {
      throw new ConflictException("Team not found");
    } else {
      let description = null;
      if (teamFromMapper[0].description !== "") {
        description = teamFromMapper[0].description;
      }

      const team = new Team(
        teamFromMapper[0].teamname,
        teamFromMapper[0].userleader,
        description,
        dateFormat(teamFromMapper[0].createdate, "dd-mm-yyyy"),
        teamFromMapper[0].location,
        teamFromMapper[0].imagebase64,
        teamFromMapper[0].imagetype,
        teamFromMapper[0].isprivate,
        null,
        teamFromMapper[0].nummaxplayers
      );
      teamFromMapper.forEach((user) => {
        team.setUserInTeam(new User(user.username));
      });

      const teamPromise = [];
      team.getUsersInTeam().forEach((user) => {
        teamPromise.push(userMapper.getUserWithImage(user.getUsername()));
      });

      return Promise.all(teamPromise).then((values) => {
        team.setUsersInTeamEmpty();
        values.forEach((value) => {
          team.setUserInTeam(value);
        });
        return team;
      });
    }
  }

  /**
   * Get all the teams the user plays on
   * @param  {HttpRequest} req - Request from client
   * @return  {Team[]} Team
   */
  async getAllMyTeams(req) {
    const teamsFromMapper = await teamMapper.getMyTeams(req.username);
    if (teamsFromMapper.length < 1) {
      return [];
    } else {
      const teams = [];
      teamsFromMapper.forEach((team) => {
        teams.push(
          new Team(
            team.teamname,
            team.userleader,
            null,
            dateFormat(team.createdate, "dd-mm-yyyy"),
            team.location,
            team.imagebase64,
            team.imagetype,
            team.isprivate,
            null,
            team.nummaxplayers
          )
        );
      });
      return teams;
    }
  }

  /**
   * Get all user-created teams
   * @param  {HttpRequest} req - Request from client
   * @return  {Team[]} Teams
   */
  async getMyTeamsCreated(req) {
    const teamsFromMapper = await teamMapper.getMyTeamsCreated(req.username);
    if (teamsFromMapper.length < 1) {
      return [];
    } else {
      const teams = [];
      teamsFromMapper.forEach((team) => {
        teams.push(
          new Team(
            team.teamname,
            team.userleader,
            null,
            null,
            null,
            null,
            dateFormat(team.createdate, "dd-mm-yyyy"),
            team.location,
            team.imagebase64,
            team.imagetype,
            team.isprivate,
            null,
            team.nummaxplayers
          )
        );
      });
      return teams;
    }
  }

  /**
   * Search a team by his uuid code
   * @param  {HttpRequest} req - Request from client
   * @return  {Team} Team
   */
  async searchByUuid(req) {
    const teamFromMapper = await teamMapper.searchByUuid(req.query.uuid);
    if (teamFromMapper.length < 1) {
      throw new ConflictException("Invalid uuid code");
    } else {
      return new Team(
        teamFromMapper[0].teamname,
        null,
        null,
        teamFromMapper[0].createdate,
        teamFromMapper[0].location,
        teamFromMapper[0].teamAvatarBase64,
        teamFromMapper[0].imagetype,
        null,
        teamFromMapper[0].uuid,
        teamFromMapper[0].nummaxplayers
      );
    }
  }

  /**
   * Get team uuid code
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Uuid code
   */
  async getTeamUuid(req) {
    const uuid = await teamMapper.getTeamUuid(req.query.teamname, req.username);
    if (uuid.length < 1) {
      throw new ConflictException("Incorrect team or youre not the leader");
    } else {
      return uuid;
    }
  }

  /**
   * Search team filtered by location and/or name
   * @param  {HttpRequest} req - Request from client
   * @return  {Team[]} Team[]
   */
  async search(req) {
    const teamsFromMapper = await teamMapper.search(
      req.query.teamname,
      req.query.location,
      req.username
    );
    if (teamsFromMapper.length < 1) {
      return [];
    } else {
      const teams = [];
      teamsFromMapper.forEach((team) => {
        teams.push(
          new Team(
            team.teamname,
            team.userleader,
            null,
            dateFormat(team.createdate, "dd-mm-yyyy"),
            team.location,
            team.imagebase64,
            team.avatarType,
            team.isprivate,
            null,
            team.nummaxplayers
          )
        );
      });
      return teams;
    }
  }

  /**
   * Join a team
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async join(req) {
    const dataIsInTeam = await teamMapper.isInTeam(
      req.body.teamname,
      req.username
    );
    if (dataIsInTeam.team.length < 1) {
      throw new NotFoundException("Team not found");
    } else if (dataIsInTeam.isInTeam.length === 1) {
      throw new ConflictException("You are already in the team");
    } else if (
      dataIsInTeam.team[0].isprivate === 1 &&
      dataIsInTeam.team[0].uuid !== req.body.uuid
    ) {
      throw new ConflictException("Incorrect team code");
    } else if (
      dataIsInTeam.numberOfPlayers[0].totalplayers + 1 >
      dataIsInTeam.team[0].nummaxplayers
    ) {
      throw new ConflictException("The team has the maximum number of players");
    } else {
      const insertUserInTeam = {
        username: req.username,
        teamname: req.body.teamname,
      };
      await teamMapper.join(insertUserInTeam);
      return "Joined team successfully";
    }
  }

  /**
   * Left a team
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async left(req) {
    const dataIsInTeam = await teamMapper.isInTeam(
      req.query.teamname,
      req.username
    );
    if (dataIsInTeam.team.length < 1) {
      throw new NotFoundException("Team not found");
    } else if (dataIsInTeam.isInTeam.length === 0) {
      throw new ConflictException("You are not in the team");
    } else if (req.username === dataIsInTeam.team.userleader) {
      throw new ConflictException("Team leader cannot left the team");
    } else {
      await teamMapper.left(req.query.teamname, req.username);
      return "Left team successfully";
    }
  }

  /**
   * Get the statistics of a team
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} matches[], number of leagued played, number of tournaments played, number of matches won, number of matches played
   */
  async stats(req) {
    const matchesPlayed = await teamMapper.getMatchesPlayed(req.query.teamname);
    if (matchesPlayed.length < 1) {
      return [];
    } else {
      let matches = [];
      matchesPlayed.forEach((match) => {
        matches.push(
          new Match(
            match.idchampionship,
            match.phase,
            match.team1,
            match.team2,
            match.matchresult1,
            match.matchresult2,
            dateFormat(match.matchdate, "dd-mm-yy h:MM"),
            match.position
          )
        );
      });
      const matchesPlayedData = await teamMapper.getChampionshipPlayed(
        req.query.teamname
      );
      return {
        matches: matches,
        leaguesPlayed: matchesPlayedData.leaguesPlayed,
        tournamentsPlayed: matchesPlayedData.tournamentsPlayed,
        matchesWon: matchesPlayedData.matchesWon,
        matchesPlayed: matchesPlayedData.matchesplayed,
      };
    }
  }
}
