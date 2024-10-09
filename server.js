import express from "express";
import http from "http";
import bodyParser from "body-parser";
import jwtAuth from "socketio-jwt-auth";
import cors from "cors";
import { socketConnection } from "./controllers/ChatController.js";
import { Server } from "socket.io";
import { userRouter } from "./routes/userRoutes.js";
import { chatRouter } from "./routes/chatRoutes.js";
import { newsRouter } from "./routes/newsRoutes.js";
import { teamRouter } from "./routes/teamRoutes.js";
import { championshipRouter } from "./routes/championshipRoutes.js";
import { meetRouter } from "./routes/meetRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
const hostname = "localhost";
const server = http.Server(app);

app.disable("x-powered-by");

app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

const socket = new Server(server, { path: "/chat" });

app.use(bodyParser.json({ limit: "10mb", extended: true }));

socket.use(
  jwtAuth.authenticate(
    {
      secret: "secret",
      algorithm: "HS256",
    },
    (payload, done) => {
      return done(null, payload.username);
    }
  )
);

socket.on("connection", socketConnection);

// Use users route in the App
app.use("/user", userRouter);

// Use messages route in the App
app.use("/chat", chatRouter);

// Use news route in the App
app.use("/news", newsRouter);

// Use teams route in the App
app.use("/team", teamRouter);

// Use championship route in the App
app.use("/championship", championshipRouter);

// Use Meets route in the App
app.use("/meet", meetRouter);

// Start server
server.listen(port, hostname, () => {
  console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});
