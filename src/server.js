#!/usr/bin/env node
const express = require('express')
const http = require('http')
const {Server} = require('socket.io')
const app = express()
const cors = require('cors')
require('dotenv').config();

const raceControl = require('./back/RaceControl')
const validateAccessKey = require("./back/ValidateAccessKey");
const lapLineControl = require('./back/LapLineControl')
const {loadSessionsFromFile} = require("./back/RaceSession");
const frontDesk = require("./back/FrontDesk");
const nextRace = require("./back/NextRace")
const getServerPort = process.env.SERVER_PORT || 3001;
const hostName = process.env.SERVER_ADDRESS

app.use(cors())
const server = http.createServer(app)

// Accessing security keys
const {RECEPTIONIST_KEY, OBSERVER_KEY, SAFETY_KEY} = process.env;
if (!RECEPTIONIST_KEY || !OBSERVER_KEY || !SAFETY_KEY) {
    console.error('\x1b[31m%s\x1b[0m', 'Access keys are not defined. Please set the environment variables before starting the server.');
    process.exit(1);
}

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
})

app.get('/ready', (req, res) => {
    res.status(200).json({status: 'connected'});
});

io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`)
    validateAccessKey(socket);
    raceControl(socket, io);
    lapLineControl(socket, io);
    frontDesk(socket, io);
    nextRace(socket);
})

server.listen(getServerPort, hostName, () => {
    console.log(`Server is running on port ${getServerPort}`)
    console.log(server.address())
})
loadSessionsFromFile();