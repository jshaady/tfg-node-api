class ClasificationTeam {

    /**
     * Constructs ClasificationTeam.
     * @constructor
     * @param {String} teamname: Name of the team.
     */
    constructor(teamName = null) {
        this.teamName = teamName;
        this.points = 0;
        this.matchesPlayed = 0;
        this.wins = 0;
        this.draws = 0;
        this.looses = 0;
    }

    getTeamName() {
        return this.teamName;
    }

    setVictory() {
        this.points += 3;
        this.matchesPlayed += 1;
        this.wins += 1;
    }

    setDraw() {
        this.points += 1;
        this.matchesPlayed += 1;
        this.draws += 1;
    }

    setLoose() {
        this.matchesPlayed += 1;
        this.looses += 1;
    }

    getPoints() {
        return this.points;
    }
}
module.exports = ClasificationTeam;