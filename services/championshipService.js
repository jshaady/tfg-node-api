import dateFormat from "dateformat";
import paginate from "jw-paginate";

import NotFoundException from "../models/NotFoundException.js";
import ConflictException from "../models/ConflictException.js";

import ChampionshipMapper from "../mapper/ChampionshipMapper.js";
import NewsMapper from "../mapper/NewsMapper.js";
import TeamMapper from "../mapper/TeamMapper.js";

import Championship from "../models/Championship.js";
import News from "../models/News.js";
import Team from "../models/Team.js";
import ClasificationTeam from "../models/ClasificationTeam.js";
import Match from "../models/Match.js";

const championshipMapper = new ChampionshipMapper();
const newsMapper = new NewsMapper();

export default class ChampionshipService {
  /**
   * Constructs Championship Service.
   * @constructor
   */
  constructor() {}

  /**
   * Create a championship
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} Confirmation message, and championship id created
   */
  async createChampionship(req) {
    const championship = new Championship(
      null,
      req.body.championshipName,
      req.username,
      req.body.numMax,
      req.body.startInscription,
      req.body.endInscription,
      req.body.startChampionship,
      req.body.location,
      req.body.sport,
      req.body.type,
      null,
      null,
      req.body.description
    );
    try {
      championship.isValidForCreate();
    } catch (e) {
      throw new ConflictException("Incorrecta data", e.getErrors());
    }
    const championshipInsert = {
      championshipname: championship.getChampionshipName(),
      creatoruser: championship.getCreatorUser(),
      nummaxteams: championship.getNumMaxTeams(),
      startinscription: championship.getStartInscription(),
      endinscription: championship.getEndInscription(),
      startchampionship: championship.getStartChampionship(),
      location: championship.getLocation(),
      sport: championship.getSport(),
      type: championship.getType(),
      description: championship.getDescription(),
      state: "Inscription",
    };
    const id = await championshipMapper.createChampionship(championshipInsert);
    //const message = 'New ' + req.body.type + ' created in ' + championship.location;
    //await newsMapper.createNews(new News('Admin', req.body.type + ' created', message, dateFormat(req.body.currentDate, 'yyyy-mm-dd HH:MM'), championship.location, null, null));
    return {
      message: championship.getType() + " created successfully",
      id: id,
    };
  }

  /**
   * Get a championship
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} championship - Championship Object
   */
  async getChampionship(req) {
    const championshipFromMapper = await championshipMapper.getChampionship(
      req.query.idChampionship,
      req.query.type
    );
    if (championshipFromMapper.championship.length < 1) {
      throw new NotFoundException("Incorrect championship name");
    } else {
      const championship = new Championship(
        championshipFromMapper.championship[0].id,
        championshipFromMapper.championship[0].championshipname,
        championshipFromMapper.championship[0].creatoruser,
        championshipFromMapper.championship[0].nummaxteams,
        dateFormat(
          championshipFromMapper.championship[0].startinscription,
          "dd-mm-yyyy"
        ),
        dateFormat(
          championshipFromMapper.championship[0].endinscription,
          "dd-mm-yyyy"
        ),
        dateFormat(
          championshipFromMapper.championship[0].startchampionship,
          "dd-mm-yyyy"
        ),
        championshipFromMapper.championship[0].location,
        championshipFromMapper.championship[0].sport,
        championshipFromMapper.championship[0].type,
        championshipFromMapper.championship[0].state,
        championshipFromMapper.championship[0].phase,
        championshipFromMapper.championship[0].description
      );

      if (championshipFromMapper.championshipTeams.length > 0) {
        championshipFromMapper.championshipTeams.forEach((team) => {
          championship.setTeamInChampionship(team);
        });
      }
      return championship;
    }
  }

  /**
   * Join a championship
   * @param {HttpRequest} req - Request from client
   * @return {String} Confirmation message
   */
  async join(req) {
    const joinData = await championshipMapper.checkJoin(
      req.body.idChampionship,
      req.body.teamname,
      req.username
    );
    if (joinData.championship.length < 1) {
      throw new NotFoundException("The championship not exists");
    } else if (joinData.championship[0].state !== "Inscription") {
      throw new ConflictException("The championship not in inscription");
    } else if (joinData.isLeader.length < 1) {
      throw new ConflictException("Incorrect team or you not the leader");
    } else if (joinData.isInChampionship[0].count !== 0) {
      throw new ConflictException(
        "Some of the team players already participate in the tournament"
      );
    } else if (joinData.currentJoined >= joinData.championship[0].nummaxteams) {
      throw new ConflictException("Maximum number of registered teams");
    } else {
      const insertChampionshipTeam = {
        teamname: req.body.teamname,
        idchampionship: joinData.championship[0].id,
      };
      await championshipMapper.join(insertChampionshipTeam);
      return "Join to the championship successfully";
    }
  }

  /**
   * Left a championship
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async left(req) {
    const teamUsers = await championshipMapper.championshipTeamUsers(
      req.query.idChampionship,
      req.username
    );
    if (teamUsers.length < 1) {
      throw new NotFoundException("Team not found");
    }
    const team = await teamMapper.getTeam(teamUsers[0].teamname);
    if (team[0].userleader !== req.username) {
      throw new ConflictException("You not the leader");
    } else {
      await championshipMapper.left(req.query.idChampionship, team[0].teamname);
      return "Leave the tournament";
    }
  }

  /**
   * Check if a team member is already participating in the tournament
   * @param  {HttpRequest} req - Request from client
   * @return  {String} info message
   */
  async participate(req) {
    const teamJoined = await teamMapper.getTeamsJoined(req.username);
    if (teamJoined.length < 1) {
      return "not_team";
    } else {
      let teams = [];
      teamJoined.forEach((team) => {
        teams.push(
          new Team(
            team.teamname,
            team.userleader,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          )
        );
      });

      let participatePromise = [];
      teams.forEach((team) => {
        participatePromise.push(
          championshipMapper.participate(req.query.idChampionship, team)
        );
      });

      return Promise.all(participatePromise).then((values) => {
        let joined = false;
        values.forEach((value) => {
          if (value === 2) {
            joined = true;
          }
        });
        if (joined) {
          return "true";
        } else if (!joined) {
          return "false";
        }
      });
    }
  }

  /**
   * Get championships matches
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} if have matches : pager - Pagination info / matches - JSON array of Match Objects
   * @return  {JSON} if not have matches: Empty array
   */
  async getMatches(req) {
    const page =
      parseInt(req.query.pageIndex) < 0 ? 0 : parseInt(req.query.pageIndex);
    const matchesFromMapper = await championshipMapper.getMaches(
      req.query.idChampionship,
      page,
      parseInt(req.query.pageSize),
      req.query.teamname
    );
    if (matchesFromMapper.totalMatches === 0) {
      return [];
    } else {
      const matches = [];
      let matchDate = null;
      matchesFromMapper.matches.forEach((match) => {
        if (match.matchdate != null) {
          matchDate = dateFormat(match.matchdate, "dd-mm-yyyy HH:MM");
        }
        matches.push(
          new Match(
            req.query.idChampionship,
            match.phase,
            match.team1,
            match.team2,
            match.matchresult1,
            match.matchresult2,
            matchDate,
            match.position
          )
        );
        matchDate = null;
      });

      const matchPromise = [];
      matches.forEach((match) => {
        matchPromise.push(championshipMapper.getMatchTeams(match));
      });

      const pager = paginate(
        matchesFromMapper.totalMatches,
        page,
        parseInt(req.query.pageSize)
      );

      return Promise.all(matchPromise).then(() => {
        return { pager, matches };
      });
    }
  }

  /**
   * Get all the matches of a tournament
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} if have matches : pager - Pagination info / matches JSON array of Match Objects
   * @return  {JSON} if not have matches: Empty array
   */
  async getBracketsMatches(req) {
    const matchesFromMapper = await championshipMapper.getBracketsMatches(
      req.query.idChampionship
    );
    if (matchesFromMapper.length === 0) {
      return [];
    } else {
      const matches = [];
      let matchDate = null;
      matchesFromMapper.forEach((matchFromMapper) => {
        if (matchFromMapper.matchdate != null) {
          matchDate = dateFormat(matchFromMapper.matchdate, "dd-mm-yyyy HH:MM");
        }
        matches.push(
          new Match(
            req.query.idChampionship,
            matchFromMapper.phase,
            matchFromMapper.team1,
            matchFromMapper.team2,
            matchFromMapper.matchresult1,
            matchFromMapper.matchresult2,
            matchDate,
            matchFromMapper.position
          )
        );
        matchDate = null;
      });

      const matchPromise = [];
      matches.forEach((match) => {
        matchPromise.push(championshipMapper.getMatchTeams(match));
      });

      return Promise.all(matchPromise).then((values) => {
        return matches;
      });
    }
  }

  /**
   * Generate the matches of a league or tournament firts phase
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async generateMatches(req) {
    const championshipData = await championshipMapper.generateMatches(
      req.body.idChampionship
    );
    if (new Date() < championshipData.championship[0].endinscription) {
      throw new ConflictException("Already in inscription period");
    } else if (championshipData.championship.length === 0) {
      throw new ConflictException("Championship not exists");
    } else {
      if (championshipData.championship[0].type === "League") {
        if (championshipData.teams.length > 1) {
          championshipData.teams.forEach((team1) => {
            championshipData.teams.forEach(async (team2) => {
              if (team1 !== team2) {
                const insertMatch1 = {
                  idchampionship: championshipData.championship[0].id,
                  team1: team1.teamname,
                  team2: team2.teamname,
                  type: "League",
                };
                await championshipMapper.createMatch(insertMatch1);
              }
            });
          });
          const updateChampionship = { state: "In progress" };
          await championshipMapper.updateChampionship(
            updateChampionship,
            req.body.idChampionship
          );
          return "Matches generated successfully";
        } else {
          throw new ConflictException("Insufficient teams in the championship");
        }
      } else if (championshipData.championship[0].type == "Tournament") {
        let phase = null;
        if (championshipData.teams.length > 1) {
          let teamArray1 = [];
          let teamArray2 = [];

          if (championshipData.teams.length === 2) phase = "Final";
          else if (championshipData.teams.length <= 4) {
            for (let i = 0; i < 2; i++) {
              teamArray1.push(championshipData.teams[i]);
            }
            for (let i = 2; i < 4; i++) {
              if (championshipData.teams[i]) {
                teamArray2.push(championshipData.teams[i]);
              } else {
                teamArray2.push(new Team(null));
              }
            }
            phase = "Semifinals";
          } else if (
            4 < championshipData.teams.length &&
            championshipData.teams.length <= 8
          ) {
            for (let i = 0; i < 4; i++) {
              teamArray1.push(championshipData.teams[i]);
            }
            for (let i = 4; i < 8; i++) {
              if (championshipData.teams[i]) {
                teamArray2.push(championshipData.teams[i]);
              } else {
                teamArray2.push(new Team(null));
              }
            }
            teamArray1.sort(() => 0.5 - Math.random());
            teamArray2.sort(() => 0.5 - Math.random());

            phase = "Quarterfinals";
          } else if (
            8 < championshipData.teams.length &&
            championshipData.teams.length <= 16
          ) {
            for (let i = 0; i < 8; i++) {
              teamArray1.push(championshipData.teams[i]);
            }
            for (let i = 8; i < 16; i++) {
              if (championshipData.teams[i]) {
                teamArray2.push(championshipData.teams[i]);
              } else {
                teamArray2.push(new Team(null));
              }
            }
            phase = "Round of 16";
          } else if (
            16 < championshipData.teams.length &&
            championshipData.teams.length <= 32
          ) {
            for (let i = 0; i < 16; i++) {
              teamArray1.push(championshipData.teams[i]);
            }
            for (let i = 16; i < 32; i++) {
              if (championshipData.teams[i]) {
                teamArray2.push(championshipData.teams[i]);
              } else {
                teamArray2.push(new Team(null));
              }
            }
            phase = "Round of 32";
          }
          for (let i = 0; i < teamArray1.length; i++) {
            let teamname1 = teamArray1[i].teamname;
            let teamname2;
            if (teamArray2[i].teamname) {
              teamname2 = teamArray2[i].teamname;
            } else {
              teamname2 = null;
            }

            let matchResult1 = null;
            let matchResult2 = null;
            let position = i;
            if (teamname1 == null) {
              teamname1 = "";
              matchResult1 = 0;
              matchResult2 = 1;
            }
            if (teamname2 == null) {
              teamname2 = "";
              matchResult1 = 1;
              matchResult2 = 0;
            }
            const insertMatch = {
              idchampionship: req.body.idChampionship,
              team1: teamname1,
              team2: teamname2,
              phase: phase,
              matchresult1: matchResult1,
              matchresult2: matchResult2,
              type: "Tournament",
              position: position,
            };
            await championshipMapper.createMatch(insertMatch);
          }
          const updateChampionship = { state: "In progress", phase: phase };
          await championshipMapper.updateChampionship(
            updateChampionship,
            req.body.idChampionship
          );
          return "Matches generated successfully";
        } else {
          throw new ConflictException("Insufficient teams in the championship");
        }
      } else {
        throw new ConflictException(
          "Incorrect championship type (not League or Tournament)"
        );
      }
    }
  }

  /**
   * Gets
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} if teams in the league : return JSON array of ClasificationTeam objects
   * @return  {JSON} if not teams in the league : return empty array
   */
  async clasification(req) {
    const championshipFromMapper = await championshipMapper.getChampionship(
      req.query.idChampionship,
      "League"
    );
    if (championshipFromMapper.championship.length < 1) {
      throw new NotFoundException("Incorrect championship name");
    } else {
      const championshipData = await championshipMapper.clasification(
        req.query.idChampionship
      );
      const teamClasificationArray = [];
      if (championshipData.teams.length < 1) {
        return [];
      } else if (championshipData.matches.length < 1) {
        championshipData.teams.forEach((team) => {
          teamClasificationArray.push(new ClasificationTeam(team.teamname));
        });
        return teamClasificationArray;
      } else {
        championshipData.teams.forEach((team) => {
          teamClasificationArray.push(new ClasificationTeam(team.teamname));
        });

        teamClasificationArray.forEach((teamClasification) => {
          championshipData.matches.forEach((match) => {
            if (match.matchresult1 !== null && match.matchresult2 !== null) {
              if (match.team1 == teamClasification.getTeamName()) {
                if (match.matchresult1 > match.matchresult2) {
                  teamClasification.setVictory();
                } else if (match.matchresult1 < match.matchresult2) {
                  teamClasification.setLoose();
                } else if (match.matchresult1 == match.matchresult2) {
                  teamClasification.setDraw();
                }
              } else if (match.team2 == teamClasification.getTeamName()) {
                if (match.matchresult1 > match.matchresult2) {
                  teamClasification.setLoose();
                } else if (match.matchresult1 < match.matchresult2) {
                  teamClasification.setVictory();
                } else if (match.matchresult1 == match.matchresult2) {
                  teamClasification.setDraw();
                }
              }
            }
          });
        });
        teamClasificationArray.sort((a, b) => b.getPoints() - a.getPoints());
        return teamClasificationArray;
      }
    }
  }

  /**
   * Set the result to a match
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async setResult(req) {
    const match = await championshipMapper.getMatch(
      req.body.idChampionship,
      req.body.team1,
      req.body.team2
    );
    if (match.length < 1) {
      throw new NotFoundException("Match not found");
    } else {
      if (
        match[0].phase !== null &&
        parseInt(req.body.matchResult1) === parseInt(req.body.matchResult2)
      ) {
        throw new ConflictException("Cannot set a draw in tournament match");
      }
      if (
        parseInt(req.body.matchResult1) < 0 ||
        parseInt(req.body.matchResult2) < 0
      ) {
        throw new ConflictException("Incorrect match result");
      }
      const updateMatch = {
        matchresult1: req.body.matchResult1,
        matchresult2: req.body.matchResult2,
      };
      await championshipMapper.setResult(
        updateMatch,
        req.body.idChampionship,
        req.body.team1,
        req.body.team2
      );
      if (match[0].phase === "Final") {
        const updateChampionship = {
          state: "Finished",
        };
        await championshipMapper.updateChampionship(
          updateChampionship,
          match[0].idchampionship
        );
      }
      if (match[0].phase === null) {
        const leagueMatchesNotFinished =
          await championshipMapper.leagueFinishedMatches(
            match[0].idchampionship
          );
        if (leagueMatchesNotFinished === 0) {
          const updateChampionship = {
            state: "Finished",
          };
          await championshipMapper.updateChampionship(
            updateChampionship,
            match[0].idchampionship
          );
        }
      }
      return "Result update successfully";
    }
  }

  /**
   * Set the date to a match
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async addDate(req) {
    const teamsLeaders = await championshipMapper.getTeamsLeader(
      req.body.team1,
      req.body.team2
    );
    if (teamsLeaders.team1FromMapper[0].userleader !== req.username) {
      throw new ConflictException("You not the team leader");
    } else {
      const matchDatesData = await championshipMapper.checkMatchDates(
        req.body.idChampionship,
        req.body.team1,
        req.body.team2,
        dateFormat(req.body.date, "yyyy-mm-dd HH:MM")
      );
      if (matchDatesData.matchDatesCount >= 5) {
        throw new ConflictException("You cannot add more dates");
      } else if (matchDatesData.matchDateCount > 0) {
        throw new ConflictException("Date already exists");
      } else {
        const matchDateInsert = {
          idchampionship: req.body.idChampionship,
          team1: req.body.team1,
          team2: req.body.team2,
          date: dateFormat(req.body.date, "yyyy-mm-dd HH:MM"),
        };
        await championshipMapper.addDate(matchDateInsert);
        return "Match date added";
      }
    }
  }

  /**
   * Delete a date from a match
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async deleteDate(req) {
    const teamsLeaders = await championshipMapper.getTeamsLeader(
      req.query.team1,
      req.query.team2
    );
    if (teamsLeaders.team1FromMapper[0].userleader !== req.username) {
      throw new ConflictException("You not the team leader");
    } else {
      const matchDatesData = await championshipMapper.checkMatchDates(
        req.query.idChampionship,
        req.query.team1,
        req.query.team2,
        dateFormat(req.query.date, "yyyy-mm-dd HH:MM")
      );
      if (matchDatesData.matchDateCount === 0) {
        throw new NotFoundException("Date not exists");
      } else {
        await championshipMapper.deleteMatchDate(
          req.query.idChampionship,
          req.query.team1,
          req.query.team2,
          dateFormat(req.query.date, "yyyy-mm-dd HH:MM")
        );
        return "Match date delete successfully";
      }
    }
  }

  /**
   * Accept a date to a match
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async acceptDate(req) {
    const teamsLeaders = await championshipMapper.getTeamsLeader(
      req.body.team1,
      req.body.team2
    );
    if (
      teamsLeaders.team1FromMapper.length < 1 ||
      teamsLeaders.team2FromMapper.length < 1
    ) {
      throw new NotFoundException("Incorrect team name");
    } else if (teamsLeaders.team2FromMapper[0].userleader !== req.username) {
      throw new ConflictException("You not the team leader");
    } else {
      const matchFromMapper = await championshipMapper.getMatch(
        req.body.idChampionship,
        req.body.team1,
        req.body.team2
      );
      if (matchFromMapper.length < 1) {
        throw new NotFoundException("Match not found");
      } else if (matchFromMapper[0].matchdate !== null) {
        throw new ConflictException("Date already assigned");
      } else {
        const matchDatesData = await championshipMapper.checkMatchDates(
          req.body.idChampionship,
          req.body.team1,
          req.body.team2,
          dateFormat(req.body.date, "yyyy-mm-dd HH:MM")
        );
        if (matchDatesData.matchDateCount < 1) {
          throw new NotFoundException("Date not exists");
        } else {
          const updateMatch = {
            matchdate: req.body.date,
          };
          await championshipMapper.updateMatch(
            updateMatch,
            req.body.idChampionship,
            req.body.team1,
            req.body.team2
          );
          await championshipMapper.deleteMatchDates(
            req.body.idChampionship,
            req.body.team1,
            req.body.team2
          );
          return "Match date assigned successfully";
        }
      }
    }
  }

  /**
   * Returns the match dates that can be selected by the other team
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} Match dates
   */
  async getMatchDates(req) {
    const teamsLeaders = await championshipMapper.getTeamsLeader(
      req.query.team1,
      req.query.team2
    );
    if (
      teamsLeaders.team1FromMapper.length < 1 ||
      teamsLeaders.team2FromMapper.length < 1
    ) {
      throw new NotFoundException("Incorrect team name");
    } else if (
      teamsLeaders.team1FromMapper[0].userleader !== req.username &&
      teamsLeaders.team2FromMapper[0].userleader !== req.username
    ) {
      throw new ConflictException("You not the team leader");
    } else {
      const matchDatesData = await championshipMapper.getMatchDates(
        req.query.idChampionship,
        req.query.team1,
        req.query.team2
      );
      const matchDates = [];
      matchDatesData.forEach((matchDate) => {
        matchDates.push(matchDate.date);
      });
      return matchDates;
    }
  }

  /**
   * Generates the next phase of a tournament
   * @param  {HttpRequest} req - Request from client
   * @return  {String} Confirmation message
   */
  async generateNextPhase(req) {
    const championshipData = await championshipMapper.getChampionship(
      req.body.idChampionship,
      "Tournament"
    );
    if (championshipData.championship.length < 1) {
      throw new NotFoundException("Incorrect championship");
    } else if (championshipData.championship[0].creatoruser !== req.username) {
      throw new ConflictException("You are not the championship creator user");
    } else {
      const matches = await championshipMapper.getMachesByPhase(
        championshipData.championship[0].id,
        championshipData.championship[0].phase
      );
      if (matches.length < 1) {
        throw new ConflictException("Incorrect phase");
      } else {
        matches.forEach((match) => {
          if (match.matchresult1 === null || match.matchresult2 === null) {
            throw new ConflictException("The matches have not yet been played");
          }
        });
        let nextPhase = null;
        if (championshipData.championship[0].phase === "Final") {
          throw new ConflictException("Cannot generate more phases");
        } else if (championshipData.championship[0].phase === "Semifinals") {
          nextPhase = "Final";
        } else if (championshipData.championship[0].phase === "Quarterfinals") {
          nextPhase = "Semifinals";
        } else if (championshipData.championship[0].phase === "Round of 16") {
          nextPhase = "Quarterfinals";
        } else if (championshipData.championship[0].phase === "Round of 32") {
          nextPhase = "Round of 16";
        }

        for (let i = 0; i < matches.length; i = i + 2) {
          let teamname1 = null;
          let teamname2 = null;
          if (matches[i].matchresult1 > matches[i].matchresult2) {
            teamname1 = matches[i].team1;
          } else {
            teamname1 = matches[i].team2;
          }
          if (matches[i + 1].matchresult1 > matches[i + 1].matchresult2) {
            teamname2 = matches[i + 1].team1;
          } else {
            teamname2 = matches[i + 1].team2;
          }
          const insertMatch = {
            idchampionship: championshipData.championship[0].id,
            team1: teamname1,
            team2: teamname2,
            phase: nextPhase,
            type: "Tournament",
            position: i / 2,
          };
          await championshipMapper.createMatch(insertMatch);
        }
        const updateChampionship = { phase: nextPhase };
        await championshipMapper.updateChampionship(
          updateChampionship,
          championshipData.championship[0].id
        );
        return "Next phase generated successfully";
      }
    }
  }

  /**
   * Get 20 championships, can be searched by location and name
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON} if have matches : pager - Pagination info / matches JSON array of Championship objects
   * @return  {JSON} if not have matches : empty array
   */
  async getAllChampionships(req) {
    const championshipsFromMapper =
      await championshipMapper.getAllChampionships(
        req.query.type,
        req.query.name,
        req.query.location,
        req.query.sport,
        parseInt(req.query.page)
      );
    if (championshipsFromMapper.championships.length < 1) {
      return [];
    } else {
      const championships = [];
      championshipsFromMapper.championships.forEach((championship) => {
        championships.push(
          new Championship(
            championship.id,
            championship.championshipname,
            championship.creatoruser,
            championship.nummaxteams,
            dateFormat(championship.startinscription, "dd-mm-yy HH:MM"),
            dateFormat(championship.endinscription, "dd-mm-yy HH:MM"),
            dateFormat(championship.startchampionship, "dd-mm-yy HH:MM"),
            championship.location,
            championship.sport,
            championship.type,
            championship.state,
            championship.phase
          )
        );
      });
      const pageChecked = parseInt(req.query.page) || 1;
      const pageSize = 20;
      const pager = paginate(
        championshipsFromMapper.totalChampionships,
        pageChecked,
        pageSize
      );

      return { pager, championships };
    }
  }

  /**
   * Get user next matches from a championship, need to have a date established
   * @param  {HttpRequest} req - Request from client
   * @return  {JSON}
   */
  async getUserNextMatches(req) {
    if (req.query.pageSize === null) {
      throw new ConflictException("Incorrect championship type");
    }
    const matchesFromMapper = await championshipMapper.getUserNextMatches(
      req.username,
      dateFormat(req.query.date, "dd-mm-yyyy HH:mm:ss"),
      parseInt(req.query.pageIndex),
      parseInt(req.query.pageSize),
      req.query.type
    );
    if (matchesFromMapper.totalMatches === 0) {
      return [];
    } else {
      const matches = [];
      matchesFromMapper.championshipMatches.forEach((match) => {
        matches.push(
          new Match(
            match.idchampionship,
            match.phase,
            match.team1,
            match.team2,
            null,
            null,
            dateFormat(match.matchdate, "dd-mm-yyyy HH:mm"),
            null
          )
        );
      });

      const page =
        parseInt(req.query.pageIndex) < 0 ? 1 : parseInt(req.query.pageIndex);
      const pager = paginate(
        matchesFromMapper.totalMatches,
        page,
        parseInt(req.query.pageSize)
      );

      return { pager, matches };
    }
  }
}
