// Teams route module.
import { Router } from "express";
import bodyParser from "body-parser";
import {
  createTeam,
  editTeam,
  editTeamImage,
  getTeam,
  getAllMyTeams,
  getMyTeamsCreatedNames,
  searchByUuid,
  getTeamUuid,
  search,
  join,
  left,
  stats,
} from "../controllers/TeamController.js";
import { verifyToken } from "../controllers/TokenController.js";

// Initialize express router
export const teamRouter = Router();

// create application/json parser
var jsonParser = bodyParser.json();

teamRouter.post("/", jsonParser, verifyToken, createTeam);

teamRouter.put("/", jsonParser, verifyToken, editTeam);

teamRouter.get("/", getTeam);

teamRouter.put("/image", jsonParser, verifyToken, editTeamImage);

teamRouter.get("/search/uuid", jsonParser, verifyToken, searchByUuid);

teamRouter.get("/search", jsonParser, verifyToken, search);

teamRouter.get("/stats", jsonParser, stats);

teamRouter.post("/join", jsonParser, verifyToken, join);

teamRouter.delete("/left", jsonParser, verifyToken, left);

teamRouter.get("/uuid", jsonParser, verifyToken, getTeamUuid);

teamRouter.get("/joined", verifyToken, jsonParser, getAllMyTeams);

teamRouter.get("/created", verifyToken, getMyTeamsCreatedNames);
