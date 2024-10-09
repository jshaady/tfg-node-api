// UserController.js

import UserService from "../services/userService.js";
const userService = new UserService();

export const profile = (req, res) => {
  tryRequest(userService.getProfile(req), res, (data) => {
    return res.status(200).json(data);
  });
};

export const deleteUser = (req, res) => {
  tryRequest(userService.delete(req), res, (data) => {
    return res.status(200).json({ success: data });
  });
};

export const signIn = (req, res) => {
  tryRequest(userService.signIn(req), res, (data) => {
    return res.status(200).json(data);
  });
};

export const signUp = (req, res) => {
  tryRequest(userService.signUp(req), res, (data) => {
    return res.status(201).json({ message: data });
  });
};

export const confirmation = (req, res) => {
  tryRequest(userService.confirmation(req), res, (data) => {
    return res.redirect(data);
  });
};

export const resendEmail = (req, res) => {
  tryRequest(userService.resendEmail(req), res, (data) => {
    return res.status(201).json({ success: data });
  });
};

export const getChatUsers = (req, res) => {
  tryRequest(userService.getChatUsers(req), res, (data) => {
    return res.status(200).json(data);
  });
};

export const checkUser = (req, res) => {
  tryRequest(userService.checkUser(req), res, (data) => {
    return res.status(200).json(data);
  });
};

export const search = (req, res) => {
  tryRequest(userService.getUser(req), res, (data) => {
    return res.status(200).json(data);
  });
};

export const updateProfile = (req, res) => {
  tryRequest(userService.updateProfile(req), res, (data) => {
    return res.status(200).json({ success: data });
  });
};

export const updateProfileAvatar = (req, res) => {
  tryRequest(userService.updateProfileAvatar(req), res, (data) => {
    return res.status(200).json({ success: data });
  });
};

export const getUsersList = (req, res) => {
  tryRequest(userService.getUsersList(req), res, (data) => {
    return res.status(200).json(data);
  });
};

export const getStats = (req, res) => {
  tryRequest(userService.getStats(req), res, (data) => {
    return res.status(200).json(data);
  });
};

export const events = (req, res) => {
  tryRequest(userService.events(req), res, (data) => {
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
  }
}
