// Chat route module.

import { Router } from "express";
// Require controller modules.
import { getMessages } from "../controllers/ChatController.js";
import { verifyToken } from "../controllers/TokenController.js";

// Initialize express router
export const chatRouter = Router();

// Get Messages for a specific user
chatRouter.get("/", verifyToken, getMessages);
