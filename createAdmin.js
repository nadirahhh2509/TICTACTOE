// filepath: /c:/Users/User/Desktop/Multi TicTacToe/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User'); // Ensure this path is correct

const uri = process.env.MONGODB_URI || "mongodb+srv://sarah:Sarah12345@cluster0.dnahz.mongodb.net/tictactoe?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("Could not connect to MongoDB Atlas", err));

async function createAdmin() {
    const username = 'admin';
    const password = 'adminpassword';
    const role = 'admin';

    const hashedPassword = await bcryptjs.hash(password, 10);
    const token = jwt.sign({ username: username, role: role }, process.env.JWT_SECRET, { expiresIn: '10m' });

    const adminUser = new User({
        username: username,
        password: hashedPassword,
        token: token,
        role: role
    });

    await adminUser.save();
    console.log('Admin user created:', adminUser);
    mongoose.disconnect();
}

createAdmin().catch(err => console.error(err));