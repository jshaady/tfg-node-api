// ChampionshipMapper.js

const InternalErrorException = require('../models/InternalErrorException');

class ChampionshipMapper {

    /**
    * Constructs Championship Mapper.
    * @constructor
    */
    constructor() {
        this.connection = require('../core/dbconnection');
    }


    /**
     * Save a championship into database.
     * @param {Json} championshipInsert: JSON Object with championship data.
     * @returns {Integer} The unique identifier of the championship
     */
    async createChampionship(championshipInsert) {
        try {
            const [create] = await this.connection.query('INSERT INTO championships SET ?', [championshipInsert]);
            return create.insertId;
        }
        catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /**
     * Get a championship from database.
     * @param {String} id championship identifier.
     * @param {String} type the championship type, Tournament or League.
     * @returns {Json} JSON with championship data, and championship teams.
     */
    async getChampionship(id, type) {
        try {
            const [championhsip] = await this.connection.query('SELECT * FROM championships WHERE id = ? AND type = ?', [id, type]);
            const [championshipTeams] = await this.connection.query('SELECT * FROM championshipteams WHERE idchampionship = ?', [id]);
            return {
                'championship': championhsip,
                'championshipTeams': championshipTeams
            };
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /**
     * Check if a user participate in a championship
     * @param {String} id championship identifier.
     * @param {String} teamname Name of the team, unique identifier.
     * @param {username} username User name, unique identifier.
     * @returns {Json} JSON with championship data, user participate in the championship, the user is the team leader and the team participate in the championship.
     */
    async checkJoin(id, teamname, username) {
        try {
            const [championship] = await this.connection.query('SELECT * FROM championships WHERE id = ?', [id]);
            const [isInChampionship] = await this.connection.query('SELECT COUNT(*) AS count FROM teams t JOIN championshipteams c JOIN teamusers u WHERE t.teamname = c.teamname AND ' +
                't.teamname=u.teamname AND c.idchampionship = ? AND u.username IN (SELECT username FROM teamusers WHERE teamname = ?)', [id, teamname]);
            const [isLeader] = await this.connection.query('SELECT * FROM teams WHERE teamname = ? AND userleader = ?', [teamname, username]);
            const [currentJoined] = await this.connection.query('SELECT COUNT(*) AS count FROM championshipteams WHERE idchampionship = ?', [id]);
            return {
                'championship': championship,
                'isInChampionship': isInChampionship,
                'isLeader': isLeader,
                'currentJoined': currentJoined[0].count
            }
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /**
     * Save a championship team into database.
     * @param {String} id championship identifier.
     * @param {Json} insertChampionshipTeam JSON object with championship and team unique identifiers
     */
    async join(insertChampionshipTeam) {
        try {
            await this.connection.query('INSERT INTO championshipteams SET ?', [insertChampionshipTeam]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /**
     * Get the team users who participates in a championship
     * @param {String} id championship identifier.
     * @param {String} username user name
     * @returns {Array} the team users.
     */
    async championshipTeamUsers(id, username) {
        const [teamUsers] = await this.connection.query('SELECT * FROM teamusers tu JOIN championshipteams ct WHERE tu.teamname = ct.teamname '
        + 'AND tu.userName = ? AND ct.idchampionship = ?', [username, id]);
        return teamUsers;
    }

     /**
     * Delete a championship team from database.
     * @param {String} id championship identifier.
     * @param {String} teamname Name of the team.
     */
    async left(id, teamname) {
        try {
            await this.connection.query('DELETE FROM championshipteams WHERE teamname = ? AND idchampionship = ?', [teamname, id]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

     /**
     * Check if a a team participates in a championship
     * @param {String} idchampionship championship identifier.
     * @param {Team} team team object.
     * @return {Int}
     */
    async participate(idchampionship, team) {
        try {
            const [participate] = await this.connection.query('SELECT * FROM championshipteams WHERE idchampionship = ? AND teamname = ?',
                [idchampionship, team.getTeamname()]);
            if (participate.length == 0) {
                return 1;
            }
            else {
                return 2;
            }
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /**
     * Get championship matches.
     * @param {String} id championship identifier.
     * @param {String} pageIndex pagination data.
     * @param {String} pageSize pagination data.
     * @param {String} teamname team name.
     * @returns {JSON} number of total matches and the matches Array.
     */
    async getMaches(id, pageIndex, pageSize, teamname) {
        try {
            const countParams = teamname !== 'null' ? [id, teamname, teamname] : [id];
            const [count] = await this.connection.query('SELECT COUNT(*) as count FROM matches WHERE idchampionship = ?' + (teamname !== 'null' ? ' AND (team1 = ? OR team2 = ?)' : '')
                , countParams);

            const offsetValue = pageIndex === 0 ? 0 : (pageIndex * pageSize - 1);
            const limit = (count[0].count - offsetValue) < pageSize && offsetValue > 0 ? (count[0].count - pageSize) : pageSize;

            const matchesParams = teamname !== 'null' ? [id, teamname, teamname, limit, offsetValue] : [id, limit, offsetValue];
            const [matches] = await this.connection.query('SELECT * FROM matches WHERE idchampionship = ?' + (teamname !== 'null' ? ' AND (team1 = ? OR team2 = ?)' : '') +
                ' ORDER BY position, matchdate DESC LIMIT ? OFFSET ?', matchesParams);

            return {
                'totalMatches': count[0].count,
                'matches': matches
            };
        } catch (e) {
            console.log(e);
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get tournament bracket matches.
     * @param {String} id championship identifier.
     * @returns {Array} matches.
     */
    async getBracketsMatches(id) {
        try {
            const [matches] = await this.connection.query('SELECT * FROM matches WHERE idchampionship = ? ORDER BY phase, position, matchdate DESC', [id]);
            return matches;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

     /** 
     * Modifies a match in database.
     * @param {JSON} updateMatch match data.
     * @param {String} idChampionship championship identifier.
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     */
    async updateMatch(updateMatch, idChampionship, team1, team2) {
        try {
            await this.connection.query('UPDATE matches SET ? WHERE idchampionship = ? AND team1 = ? AND team2 = ?',
                [updateMatch, idChampionship, team1, team2]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Delete all match dates, used when the visting team acepts a match date, deleting other dates.
     * @param {String} idChampionship championship identifier.
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     */
    async deleteMatchDates(idChampionship, team1, team2) {
        try {
            await this.connection.query('DELETE FROM matchdates WHERE idchampionship = ? AND team1 = ? AND team2 = ?',
                [idChampionship, team1, team2]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Delete a match date
     * @param {String} idChampionship championship identifier.
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     */
    async deleteMatchDate(idChampionship, team1, team2, date) {
        try {
            await this.connection.query('DELETE FROM matchdates WHERE idchampionship = ? AND team1 = ? AND team2 = ? AND date = ?',
                [idChampionship, team1, team2, date]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Set into the match object the teams who plays this match
     * @param {Match} match
     */
    async getMatchTeams(match) {
        try {
            const [team1] = await this.connection.query('SELECT * FROM teams WHERE teamname = ?', [match.getTeam1()]);
            const [team2] = await this.connection.query('SELECT * FROM teams WHERE teamname = ?', [match.getTeam2()]);
            match.setTeams(team1, team2);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Generates championship matches
     * @param {String} id championship identifier
     */
    async generateMatches(id) {
        try {
            const [championship] = await this.connection.query('SELECT * FROM championships WHERE id = ?', [id]);
            const [teams] = await this.connection.query('SELECT * FROM championshipteams WHERE idchampionship = ?', [id]);
            return {
                'championship': championship,
                'teams': teams
            }
        }
        catch (e) {
            console.log(e)
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Save a match into database
     * @param {JSON} insertMatch match data
     */
    async createMatch(insertMatch) {
        try {
            this.connection.query('INSERT INTO matches SET ?', [insertMatch]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

     /** 
     * Modified championship data.
     * @param {JSON} updateChampionship championship data
     * @param {id} id championship identifier
     */
    async updateChampionship(updateChampionship, id) {
        try {
            await this.connection.query('UPDATE championships SET ? WHERE id = ?', [updateChampionship, id]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get League clasification.
     * @param {id} id championship identifier
     * @return {JSON} championship teams and matches
     */
    async clasification(id) {
        try {
            const [teams] = await this.connection.query('SELECT * FROM championshipteams WHERE idchampionship = ?', [id]);
            const [matches] = await this.connection.query('SELECT * FROM matches WHERE idchampionship = ?', [id]);
            return {
                'teams': teams,
                'matches': matches
            }
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get championship match.
     * @param {String} idChampionship championship identifier
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     * @return {Array} match
     */
    async getMatch(idChampionship, team1, team2) {
        try {
            const [match] = await this.connection.query('SELECT * FROM matches WHERE idchampionship = ? AND team1 = ? AND team2 = ?',
                [idChampionship, team1, team2]);
            return match;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

     /** 
     * Set match result.
     * @param {JSON} updateMatch match data
     * @param {String} idChampionship championship identifier.
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     * @return {Array} match
     */
    async setResult(updateMatch, idChampionship, team1, team2) {
        try {
            await this.connection.query('UPDATE matches SET ? WHERE idchampionship = ? AND team1 = ? AND team2 = ?',
                [updateMatch, idChampionship, team1, team2]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get the number of matches without result
     * @param {String} id championship identifier
     * @return {Integer} number of matches without result
     */
    async leagueFinishedMatches(idChampionship) {
        try {
            const [leagueMatchesNotFinished] = await this.connection.query('SELECT COUNT(*) AS count FROM matches WHERE idchampionship = ? AND matchresult1 IS NULL AND matchresult2 IS NULL',
                [idChampionship]);
            return leagueMatchesNotFinished[0].count;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get tournaments matches filtered by phase
     * @param {String} id championship identifier
     * @param {String} phase championship phase
     * @return {Array} matches
     */
    async getMachesByPhase(id, phase) {
        try {
            const [matches] = await this.connection.query('SELECT * FROM matches WHERE idchampionship = ? AND phase = ? ORDER BY position',
                [id, phase]);
            return matches;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Check matches filtered by a date 
     * @param {String} idChampionship championship identifier
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     * @param {Date} date date
     * @return {JSON} number of matches from a championship, number of matches filtered by date 
     */
    async checkMatchDates(idChampionship, team1, team2, date) {
        try {
            const [matchDatesCount] = await this.connection.query('SELECT COUNT(*) AS count FROM matchdates WHERE idchampionship = ? AND team1 = ? AND team2 = ?',
                [idChampionship, team1, team2]);
            const [matchDateCount] = await this.connection.query('SELECT COUNT(*) AS count FROM matchdates WHERE idchampionship = ? AND team1 = ? AND team2 = ? AND date = ?',
                [idChampionship, team1, team2, date]);
            return date = {
                'matchDatesCount': matchDatesCount[0].count,
                'matchDateCount': matchDateCount[0].count
            };
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get the possible dates of a match
     * @param {String} idChampionship championship identifier
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     * @return {Array} match dates.
     */
    async getMatchDates(idChampionship, team1, team2) {
        try {
            const [matchDates] = await this.connection.query('SELECT * FROM matchdates WHERE idchampionship = ? AND team1 = ? AND team2 = ?',
                [idChampionship, team1, team2]);
            return matchDates;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get a possible date of a match
     * @param {String} idChampionship championship identifier
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     * @param {Date} date date
     * @return {Array} match date.
     */
    async getMatchDate(idChampionship, team1, team2, date) {
        try {
            const [matchDate] = await this.connection.query('SELECT * FROM matchdates WHERE idchampionship = ? AND team1 = ? AND team2 = ? AND date = ?',
                [idChampionship, team1, team2, date]);
            return matchDate;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

     /** 
     * Save a possible date into database
     * @param {JSON} matchDateInsert matcha date data.
     */
    async addDate(matchDateInsert) {
        try {
            await this.connection.query('INSERT INTO matchdates SET ?', [matchDateInsert]);
            return;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

     /** 
     * Gets teams leeaders
     * @param {String} team1 Local team name
     * @param {String} team2 Visiting team name
     * @returns {JSON} Local team leader, visiting team leader
     */
    async getTeamsLeader(team1, team2) {
        try {
            const [team1FromMapper] = await this.connection.query('SELECT userleader FROM teams WHERE teamname = ?', [team1]);
            const [team2FromMapper] = await this.connection.query('SELECT userleader FROM teams WHERE teamname = ?', [team2]);
            return {
                'team1FromMapper': team1FromMapper,
                'team2FromMapper': team2FromMapper
            };
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

     /** 
     * Get all the championships filtered by type, sport, location, name, date and paginated
     * @param {String} type Championship type, league or tournament
     * @param {String} name Championship name
     * @param {String} location Championship location
     * @param {String} sport Championship sport
     * @param {String} page Pagination data, current page
     * @param {Date} date Championship date
     * @returns {JSON} Number of total chamionships and championships for a page.
     */
    async getAllChampionships(type, name, location, sport, page) {
        try {
            const offsetValue = page === 1 ? 0 : (page - 1) * 20 - 1;
            const queryParameters = name !== 'null' && location !== 'null' && sport !== 'all' ? [type, '%' + name + '%', '%' + location + '%', sport] :
                name === 'null' && location !== 'null' && sport !== 'all' ? [type, '%' + location + '%', sport] :
                    name !== 'null' && location === 'null' && sport !== 'all' ? [type, '%' + name + '%', sport] :
                        name !== 'null' && location !== 'null' && sport === 'all' ? [type, '%' + name + '%', '%' + location + '%'] :
                            name === 'null' && location === 'null' && sport !== 'all' ? [type, sport] :
                                name === 'null' && location !== 'null' && sport === 'all' ? [type, '%' + location + '%'] :
                                    name !== 'null' && location === 'null' && sport === 'all' ? [type, '%' + name + '%'] :
                                        [type];

            const countQuery = 'SELECT COUNT(*) AS count FROM championships WHERE ' +
                '(state = "In progress" OR state = "Inscription") AND type = ? ' +
                (name !== 'null' ? 'AND championshipname LIKE ? ' : '') +
                (location !== 'null' ? 'AND location LIKE ? ' : '') +
                (sport !== 'all' ? 'AND sport = ? ' : '');

            const championshipsQuery = 'SELECT * FROM championships WHERE ' +
                '(state = "In progress" OR state = "Inscription") AND type = ? ' +
                (name !== 'null' ? 'AND championshipname LIKE ? ' : '') +
                (location !== 'null' ? 'AND location LIKE ? ' : '') +
                (sport !== 'all' ? 'AND sport = ? ' : '') +
                'ORDER BY championshipname' +
                ' LIMIT 20 OFFSET ' + offsetValue;

            const [count] = await this.connection.query(countQuery, queryParameters);
            const [championships] = await this.connection.query(championshipsQuery, queryParameters);
            return {
                'totalChampionships': count[0].count,
                'championships': championships
            };
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get user next championships
     * @param {String} username user name
     * @param {Date} date match date
     * @param {String} page Pagination data, current page
     * @param {String} type Championship type, league or tournament
     * @returns {Array} championship data
     */
    async getUserNextChampionships(username, date, page, type) {
        try {
            const [championshipData] = await this.connection.query('SELECT DISTINCT c.id, tu.teamname, c.championshipname, c.id FROM teamusers tu JOIN championshipteams ct JOIN championships c JOIN matches m ' +
                'WHERE tu.username = ? AND tu.teamname = ct.teamname AND ct.idchampionship = c.id AND c.id = m.idchampionship AND ' +
                '(tu.teamname = m.team1 || tu.teamname = m.team2) AND c.type = ? AND m.matchresult1 IS NULL AND m.matchdate IS NOT NULL AND ' +
                'm.matchdate > ? ORDER BY m.matchdate LIMIT ? OFFSET ?', [username, type, date, 5, page * 5]);
            return championshipData;
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }

    /** 
     * Get user next macthes
     * @param {String} username user name
     * @param {Date} date match date
     * @param {String} pageIndex Pagination data, current page
     * @param {String} pageSize pagination data, number of matches for page
     * @param {String} type Championship type, league or tournament
     * @returns {JSON} number of total matches and matches.
     */
    async getUserNextMatches(username, date, pageIndex, pageSize, type) {
        try {

            const [count] = await this.connection.query('SELECT COUNT(*) AS count FROM teamusers tu JOIN championshipteams ct JOIN championships c JOIN matches m ' +
                'WHERE tu.username = ? AND tu.teamname = ct.teamname AND ct.idchampionship = c.id AND c.id = m.idchampionship AND ' +
                '(tu.teamname = m.team1 || tu.teamname = m.team2) AND c.type = ? AND m.matchresult1 IS NULL AND m.matchdate IS NOT NULL AND ' +
                'm.matchdate > ?', [username, type, date]);


            const offsetValue = pageIndex === 0 ? 0 : (pageIndex * pageSize - 1);
            const limit = (count[0].count - offsetValue) < pageSize && offsetValue > 0 ? (count[0].count - pageSize) : pageSize;

            const [championshipMatches] = await this.connection.query('SELECT * FROM teamusers tu JOIN championshipteams ct JOIN championships c JOIN matches m ' +
                'WHERE tu.username = ? AND tu.teamname = ct.teamname AND ct.idchampionship = c.id AND c.id = m.idchampionship AND ' +
                '(tu.teamname = m.team1 || tu.teamname = m.team2) AND c.type = ? AND m.matchresult1 IS NULL AND m.matchdate IS NOT NULL AND ' +
                'm.matchdate > ? ORDER BY m.matchdate LIMIT ? OFFSET ?', [username, type, date, limit, offsetValue]);
            return {
                'totalMatches': count[0].count,
                'championshipMatches': championshipMatches
            };
        } catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }
}

module.exports = ChampionshipMapper;