const NotValidException = require('./NotValidException');
const Team = require('./Team');

class Match {

    /**
     * Constructs Match.
     * @constructor
     * @param {Number} idChampionship: Championship id.
     * @param {String} phase: Match phase, only for tournaments.
     * @param {Team} team1: Local team.
     * @param {Team} team2: Visiting team.
     * @param {String} matchResult1: Match result for local team.
     * @param {String} matchResult2: Match result for visiting team.
     * @param {String} matchDate: Match date.
     * @param {String} position: Match position, used for tournament brackets.
     */
    constructor(idChampionship = null, phase = null, team1 = null, team2 = null, matchResult1 = null, matchResult2 = null, matchDate = null, position = null) {
        this.idChampionship = idChampionship;
        this.phase = phase;
        this.team1 = team1;
        this.team2 = team2;
        this.matchResult1 = matchResult1;
        this.matchResult2 = matchResult2;
        this.matchDate = matchDate;
        this.position = position;
    }

    getIdChampionship() {
        return this.idChampionship;
    }

    getPhase() {
        return this.phase;
    }

    getTeam1() {
        return this.team1;
    }

    getTeam2() {
        return this.team2;
    }

    getMatchResult1() {
        return this.matchResult1
    }

    getMatchResult2() {
        return this.matchResult2
    }

    getMatchDate() {
        return this.matchDate;
    }

    getPosition() {
        return this.position;
    }

    /**
     * Set the Teams in a match
     * @param {Array} team1: Local team
     * @param {Array} team2: Visiting team
     */
    setTeams(team1, team2) {
        if (team1.length !== null) {
            this.team1 = new Team(team1[0].teamname, team1[0].userleader, null, null, team1[0].location, null, null, null, null, null);
        } else {
            this.team1 = "";
        }
        if (team2.length !== null) {
            this.team2 = new Team(team2[0].teamname, team2[0].userleader, null, null, team2[0].location, null, null, null, null, null);
        } else {
            this.team2 = "";
        }
    }
}
module.exports = Match;