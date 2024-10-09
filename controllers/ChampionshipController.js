/* ChampionshipController.js */

import ChampionshipService from "../services/championshipService.js";
const championshipService = new ChampionshipService();

const createChampionship = (req, res) => {
  tryRequest(championshipService.createChampionship(req), res, (data) => {
    return res.status(201).json({ success: data.message, id: data.id });
  });
};

const getChampionship = (req, res) => {
  tryRequest(championshipService.getChampionship(req), res, (data) => {
    return res.status(200).json(data);
  });
};

const join = (req, res) => {
  tryRequest(championshipService.join(req), res, (data) => {
    return res.status(201).json({ success: data });
  });
};

const left = (req, res) => {
  tryRequest(championshipService.left(req), res, (data) => {
    return res.status(200).json({ success: data });
  });
};

const participate = (req, res) => {
  tryRequest(championshipService.participate(req), res, (data) => {
    return res.status(200).json({ isJoined: data });
  });
};

const getMatches = (req, res) => {
  tryRequest(championshipService.getMatches(req), res, (data) => {
    return res.status(200).json(data);
  });
};

const getBracketsMatches = (req, res) => {
  tryRequest(championshipService.getBracketsMatches(req), res, (data) => {
    return res.status(200).json(data);
  });
};

const generateMatches = (req, res) => {
  tryRequest(championshipService.generateMatches(req), res, (data) => {
    return res.status(201).json({ success: data });
  });
};

const clasification = (req, res) => {
  tryRequest(championshipService.clasification(req), res, (data) => {
    return res.status(200).json(data);
  });
};

const setResult = (req, res) => {
  tryRequest(championshipService.setResult(req), res, (data) => {
    return res.status(201).json({ success: data });
  });
};
const getMatchDates = (req, res) => {
  tryRequest(championshipService.getMatchDates(req), res, (data) => {
    return res.status(200).json(data);
  });
};

const addDate = (req, res) => {
  tryRequest(championshipService.addDate(req), res, (data) => {
    return res.status(201).json({ success: data });
  });
};

const deleteDate = (req, res) => {
  tryRequest(championshipService.deleteDate(req), res, (data) => {
    return res.status(201).json({ success: data });
  });
};

const acceptDate = (req, res) => {
  tryRequest(championshipService.acceptDate(req), res, (data) => {
    return res.status(201).json({ success: data });
  });
};

const generateNextPhase = (req, res) => {
  tryRequest(championshipService.generateNextPhase(req), res, (data) => {
    return res.status(201).json({ success: data });
  });
};

const getAllChampionships = (req, res) => {
  tryRequest(championshipService.getAllChampionships(req), res, (data) => {
    return res.status(200).json(data);
  });
};

const getUserNextMatches = (req, res) => {
  tryRequest(championshipService.getUserNextMatches(req), res, (data) => {
    return res.status(200).json(data);
  });
};

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
    case "BadRequestException":
      return res.status(400).json({ error: e.getMessage() });
    case "UnauthorizedRequestException":
      return res.status(401).json({ error: e.getMessage() });
    case "NotFoundException":
      return res.status(404).json({ error: e.getMessage() });
    case "ConflictException":
      return res
        .status(409)
        .json({ error: e.getMessage(), errors: e.getArgs() });
    case "InternalErrorException":
      return res.status(500).json({ error: e.getMessage() });
    case "NotValidException":
      return res
        .status(409)
        .json({ error: e.getMessage(), errors: e.getArgs() });
  }
}

export {
  createChampionship,
  getChampionship,
  join,
  left,
  participate,
  getMatches,
  getBracketsMatches,
  generateMatches,
  clasification,
  setResult,
  getMatchDates,
  addDate,
  deleteDate,
  acceptDate,
  generateNextPhase,
  getAllChampionships,
  getUserNextMatches,
};
