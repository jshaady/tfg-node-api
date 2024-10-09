// Meet route module.

import { Router } from "express";
import bodyParser from "body-parser";
import { verifyToken } from "../controllers/TokenController.js";
import {
  createMeet,
  getMeet,
  getMeets,
  joinMeet,
  leftMeet,
} from "../controllers/MeetController.js";

// Initialize express router
export const meetRouter = Router();

// create application/json parser
const jsonParser = bodyParser.json();

// Require controller modules.

meetRouter.post("/", jsonParser, verifyToken, createMeet);

meetRouter.get("/", jsonParser, getMeet);

meetRouter.post("/join", jsonParser, verifyToken, joinMeet);

meetRouter.delete("/left", jsonParser, verifyToken, leftMeet);

meetRouter.get("/list", getMeets);
