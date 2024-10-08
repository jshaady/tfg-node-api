// MeetController.js

const MeetService = require('../services/meetService');
const meetService = new MeetService();

exports.createMeet = (req, res) => {
    tryRequest(meetService.createMeet(req), res, data => {
        return res.status(201).json({ success: data.message, id: data.id });
    });
}

exports.getMeet = (req, res) => {
    tryRequest(meetService.getMeet(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.getMeets = (req, res) => {
    tryRequest(meetService.getMeets(req), res, data => {
        return res.status(200).json(data);
    });
}

exports.joinMeet = (req, res) => {
    tryRequest(meetService.joinMeet(req), res, data => {
        return res.status(200).json({success: data});
    });
}

exports.leftMeet = (req, res) => {
    tryRequest(meetService.leftMeet(req), res, data => {
        return res.status(200).json({success: data});
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
