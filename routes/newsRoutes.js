// News route module.

import { Router } from "express";
import bodyParser from "body-parser";
import { verifyToken } from "../controllers/TokenController.js";
import { getNews, createNews } from "../controllers/NewsController.js";

// Initialize express router
export const newsRouter = Router();

// create application/json parser
const jsonParser = bodyParser.json();

// Require controller modules.

newsRouter.post("/", verifyToken, createNews);

newsRouter.get("/", verifyToken, jsonParser, getNews);
