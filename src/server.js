const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require('express-session');
const User = require('./models/User'); // Ensure this path is correct

const app = express();

const uri = "mongodb+srv://sarah:sarah123@cluster0.1qp6x.mongodb.net/tictactoe?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("Could not connect to MongoDB Atlas", err));

const server = http.createServer(app);
const io = new Server(server);

const templatePath = path.join(__dirname, "../templates/views");

app.use(express.static(path.resolve("")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs");
app.set("views", templatePath);

// User signup route
app.get('/signup', (req, res) => {
  res.render('signup');
});

// User login route
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle signup requests
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const newUser = new User({ username, password });
    await newUser.save();
    console.log('User created:', newUser);
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

// Handle login requests
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    console.log('Login attempt:', { username, password, user });
    if (user) {
      res.redirect('/game');
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

// Fetch all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

let arr = [];
let playingArray = [];

io.on("connection", (socket) => {
  socket.on("find", (e) => {
    if (e.name != null) {
      arr.push(e.name);
      if (arr.length >= 2) {
        let p1obj = {
          p1name: arr[0],
          p1value: "X",
          p1move: ""
        };
        let p2obj = {
          p2name: arr[1],
          p2value: "O",
          p2move: ""
        };

        let obj = {
          p1: p1obj,
          p2: p2obj,
          sum: 1
        };
        playingArray.push(obj);

        arr.splice(0, 2);

        io.emit("find", { allPlayers: playingArray });
      }
    }
  });

  socket.on("move", (data) => {
    let game = playingArray.find(game => game.p1.p1name === data.name || game.p2.p2name === data.name);
    if (game) {
      if (game.p1.p1name === data.name) {
        game.p1.p1move = data.move;
      } else {
        game.p2.p2move = data.move;
      }
      game.sum += data.moveValue;
      io.emit("playing", game);
    }
  });

  socket.on("gameOver", (e) => {
    playingArray = playingArray.filter(obj => obj.p1.p1name !== e.name);
    console.log(playingArray);
    console.log("Game Over");
  });
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'game.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { server, io, app };

