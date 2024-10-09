// Championship route module.

import { Router } from "express";
import bodyParser from "body-parser";
import { verifyToken } from "../controllers/TokenController.js";

// Initialize express router
export const championshipRouter = Router();

// create application/json parser
var jsonParser = bodyParser.json();

// Require controller modules.
import {
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
} from "../controllers/ChampionshipController.js";

championshipRouter.post("/", jsonParser, verifyToken, createChampionship);

championshipRouter.get("/", getChampionship);

championshipRouter.get("/all", getAllChampionships);

championshipRouter.post("/join", jsonParser, verifyToken, join);

championshipRouter.delete("/left", jsonParser, verifyToken, left);

championshipRouter.post(
  "/generate/matches",
  jsonParser,
  verifyToken,
  generateMatches
);

championshipRouter.post(
  "/generate/next/phase",
  jsonParser,
  verifyToken,
  generateNextPhase
);

championshipRouter.put("/set/result", jsonParser, verifyToken, setResult);

championshipRouter.post("/add/date", jsonParser, verifyToken, addDate);

championshipRouter.delete("/delete/date", jsonParser, verifyToken, deleteDate);

championshipRouter.put("/accept/date", jsonParser, verifyToken, acceptDate);

championshipRouter.get("/match/dates", jsonParser, verifyToken, getMatchDates);

championshipRouter.get("/participate", verifyToken, participate);

championshipRouter.get("/clasification", clasification);

championshipRouter.get("/matches", getMatches);

championshipRouter.get("/brackets/matches", getBracketsMatches);

championshipRouter.get("/user/next/matches", verifyToken, getUserNextMatches);
