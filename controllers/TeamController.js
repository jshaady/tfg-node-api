// TeamController.js

const TeamService = require('../services/teamsService');
const teamService = new TeamService();

exports.createTeam = (req, res) => {
    tryRequest(teamService.createTeam(req), res, data => {
        return res.status(201).json({success: data.message, id: data.id});
    });
}

exports.editTeam = (req, res) => {
    tryRequest(teamService.editTeam(req), res, data => {
        return res.status(200).json({success: data});
    });
}

exports.editTeamImage = (req, res) => {
    tryRequest(teamService.editTeamImage(req), res, data => {
        return res.status(200).json({success: data});
    });
}

exports.getTeam = (req, res) => {
    tryRequest(teamService.getTeam(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.getAllMyTeams = (req, res) => {
    tryRequest(teamService.getAllMyTeams(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.getMyTeamsCreatedNames = (req, res) => {
    tryRequest(teamService.getMyTeamsCreated(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.searchByUuid = (req, res) => {
    tryRequest(teamService.searchByUuid(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.getTeamUuid = (req, res) => {
    tryRequest(teamService.getTeamUuid(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.search = (req, res) => {
    tryRequest(teamService.search(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.join = (req, res) => {
    tryRequest(teamService.join(req), res, data => {
        return res.status(200).json({success: data});
    });
}

exports.left = (req, res) => {
    tryRequest(teamService.left(req), res, data => {
        return res.status(200).json({success: data});
    });
}

exports.stats = (req, res) => {
    tryRequest(teamService.stats(req), res, data => {
        return res.status(200).json(data);
    });
}

/**
 * execute the request, data returned or capture the exception throwed by the service
 * @param {HttpRequest} req - Service function to be executed.
 * @param {HttpResponse} res - The http response.
 * @param {requestCallback} callback - The callback that handles the response.
 */
async function tryRequest(req, res, callback) {
    try {
        callback(await req);
    } catch (e) {
        return toStatusCode(e, res);
    }
}

/**
 * Method that return an error message to the client, if something goes wrong
 */
function toStatusCode(e, res) {
    switch (e.constructor.name) {
        case 'BadRequestException':
            return res.status(400).json({ error: e.getMessage() });
        case 'UnauthorizedRequestException':
            return res.status(401).json({ error: e.getMessage() });
        case 'NotFoundException':
            return res.status(404).json({ error: e.getMessage() });
        case 'ConflictException':
            return res.status(409).json({ error: e.getMessage(), errors: e.getArgs() });
        case 'InternalErrorException':
            return res.status(500).json({ error: e.getMessage() });
        case 'NotValidException':
            return res.status(409).json({ error: e.getMessage(), errors: e.getArgs() });
    }
}


