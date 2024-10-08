const express = require('express');
const http = require('http');
const app = express();
const port = process.env.PORT || 3000;
const hostname = 'localhost';
const bodyParser = require('body-parser');
const jwtAuth = require('socketio-jwt-auth');
const chatController = require('./controllers/ChatController');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4200'
})); // Habilitamos el CORS para impedir errores en peticiones HTML hechas desde la aplicacion
const server = http.Server(app);

const io = require('socket.io')(server, { path: '/chat' });

app.use(bodyParser.json({limit: '10mb', extended: true}));

io.use(jwtAuth.authenticate({
  secret: 'secret',
  algorithm: 'HS256'
}, (payload, done) => {
  return done(null, payload.username);
}));
 
io.on('connection', chatController.connection);

// Use users route in the App
app.use('/user', require('./routes/userRoutes'));

// Use messages route in the App
app.use('/chat', require('./routes/chatRoutes'));

// Use news route in the App
app.use('/news', require('./routes/newsRoutes'));

// Use teams route in the App
app.use('/team', require('./routes/teamRoutes'));

// Use championship route in the App
app.use('/championship', require('./routes/championshipRoutes'));

// Use Meets route in the App
app.use('/meet', require('./routes/meetRoutes'));

// Start server
server.listen(port, hostname, () => {
  console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});
