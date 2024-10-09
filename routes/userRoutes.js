// Users route module.

import { Router } from "express";
import bodyParser from "body-parser";
import {
  deleteUser,
  signIn,
  signUp,
  updateProfile,
  updateProfileAvatar,
  profile,
  search,
  checkUser,
  getChatUsers,
  getStats,
  events,
  getUsersList,
  confirmation,
  resendEmail,
} from "../controllers/UserController.js";

// Require controller modules.
import { verifyToken } from "../controllers/TokenController.js";

export const userRouter = Router();
// create application/json parser
const jsonParser = bodyParser.json();

userRouter.delete("/", jsonParser, verifyToken, deleteUser);

userRouter.put("/", jsonParser, verifyToken, updateProfile);

userRouter.put("/image", jsonParser, verifyToken, updateProfileAvatar);

userRouter.post("/signin", jsonParser, signIn);

userRouter.post("/signup", jsonParser, signUp);

userRouter.get("/profile", jsonParser, verifyToken, profile);

userRouter.get("/search", search);

userRouter.get("/checkuser", verifyToken, checkUser);

userRouter.get("/userchats", verifyToken, getChatUsers);

userRouter.get("/stats", getStats);

userRouter.get("/events", verifyToken, events);

userRouter.get("/list", verifyToken, getUsersList);

userRouter.get("/confirmation/:emailToken", confirmation);

userRouter.get("/resend/email", resendEmail);
