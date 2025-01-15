const {v4: uuidv4} = require('uuid');
let sessions = []
const getSessionDuration = () => {
    return process.env.NODE_ENV === 'development' ? 1 : 10; // 1 min for dev, 10 min for production
}

function saveSessionsToFile() {
    const fs = require('fs');
    const path = require('path');
    const sessionFilePath = path.join(__dirname, 'sessions.json');
    fs.writeFileSync(sessionFilePath, JSON.stringify(sessions));
}

function loadSessionsFromFile() {
    const fs = require('fs');
    const path = require('path');
    const sessionFilePath = path.join(__dirname, 'sessions.json');
    if (fs.existsSync(sessionFilePath)) {
        const data = fs.readFileSync(sessionFilePath, 'utf8'); // Read the file as a UTF-8 string
        try {
            sessions = JSON.parse(data); // Parse the JSON string into an object
            console.log("Sessions loaded from file");
        } catch (error) {
            console.error("Error parsing sessions.json:", error);
            sessions = []; // Reset to an empty array if parsing fails
        }
    } else {
        console.log("No session file found, starting with an empty session list.");
    }
}

const getAllSessions = () => {
    return sessions
};
const getNextSession = () => {
    try {
        return sessions
            .filter(session => !session.hasStarted)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0]
    } catch (err) {
        console.log("Error getting next session: " + err)
        return null
    }
}
const getRunningSession = () => {
    return sessions
        .filter(session => session.hasStarted && !session.hasFinished)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0]
}
const updateRunningSessionRemainingTime = (remainingTime) => {
    const runningSession = getRunningSession()
    if (runningSession) {
        runningSession.timeRemaining = remainingTime
        saveSessionsToFile()
    } else {
        console.error('No running session found')
    }
}

const updateRunningSessionRaceMode = (raceMode) => {
    const runningSession = getRunningSession()
    if (runningSession) {
        runningSession.raceMode = raceMode
        saveSessionsToFile()
    } else {
        console.error('No running session found')
    }
}

const hasComingOrRunningRace = () => {
    const showRaceControl = sessions.filter(session => !session.hasStarted || !session.hasFinished).length > 0;
    console.log("has coming or running session: " + showRaceControl)
    return showRaceControl
}
const hasRunningSession = () => {
    return sessions.filter(session => session.hasStarted && !session.hasFinished).length > 0
}
const addSession = (data) => {
    const {startTime, drivers} = data
    console.log(data)
    // Validate the start time
    const raceStartTime = new Date(startTime)
    const now = new Date()
    if (isNaN(raceStartTime.getTime()) || raceStartTime < now) {
        console.log("start time cant by in bast")
        return
    }

    const driverNames = new Set()
    const carNumbers = new Set()
    let isValidSession = true

    // Check if driver names are unique
    drivers.forEach(driver => {
        if (driverNames.has(driver.name)) {
            console.error(`Duplicate driver name found: ${driver.name}`)
            isValidSession = false
        } else {
            driverNames.add(driver.name)
        }

        if (carNumbers.has(driver.carNumber)) {
            console.error(`Duplicate car number found: ${driver.carNumber}`)
            isValidSession = false
        } else {
            carNumbers.add(driver.carNumber)
        }
    })
    if (!isValidSession) {
        console.error("Duplicate driver names or car numbers are not allowed.")
        return
    }

    // Create a session object with start time, duration, hasStarted and driver info
    const session = {
        id: uuidv4(),
        startTime: raceStartTime.toISOString(),
        timeRemaining: null,
        hasStarted: false,//when started remove from front desk
        hasFinished: false,// when finished Add an alert message to next race "Proceed to the paddock"
        drivers: drivers.map(driver => ({
            name: driver.name,
            carNumber: driver.carNumber,
            hasStarted: false,
            hasFinished: false,
            fastestLap: 0,
            laps: 0
        }))
    }
    sessions.push(session)
    sessions = sessions
        .filter(session => !session.hasFinished)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)); // Sort by startTime
    saveSessionsToFile()
}

const updateSession = (data) => {

    const sessionIndex = sessions.findIndex(session => session.id === data.id);
    if (sessionIndex === -1) {
        console.log("No session found with id " + data.id);
        return;
    }

    // Update the session with the new data
    sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...data.sessionData // Assuming sessionData contains the updated fields
    };

    // Update the drivers specifically
    if (data.sessionData.drivers) {
        sessions[sessionIndex].drivers = data.sessionData.drivers.map(driver => ({
            ...driver, // Spread existing driver properties
            // You can add any additional logic here if needed
        }));
    }
    saveSessionsToFile()
}

const deleteSession = (id) => {
    const sessionIndex = sessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) {
        console.error("session_error", {message: "No session found with id " + id});
        return;
    }
    sessions.splice(sessionIndex, 1);
    saveSessionsToFile();
}

const startNextSession = () => {
    try {
        const session = getRunningSession() || sessions
            .filter(session => !session.hasStarted)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0]
        session.hasStarted = true
        session.timeRemaining = session.timeRemaining !== null ? session.timeRemaining : getSessionDuration()
        console.log("starting session")
        console.log(session)
        saveSessionsToFile()
    } catch (err) {
        console.log("Starting session Error: " + err)
    }
}
const finishRunningSession = () => {
    console.log("finish Session")
    try {
        sessions
            .find(session => session.hasStarted && !session.hasFinished).hasFinished = true
        sessions = sessions.filter(session => !session.hasStarted || !session.hasFinished)
        saveSessionsToFile()
    } catch (err) {
        console.error("Has finished error: " + err)
    }
}

module.exports = {
    hasRunningSession,
    hasComingOrRunningRace,
    loadSessionsFromFile,
    getNextSession,
    startNextSession,
    finishRunningSession,
    updateSession,
    addSession,
    getAllSessions,
    getRunningSession,
    deleteSession,
    saveSessionsToFile,
    getSessionDuration,
    updateRunningSessionRemainingTime,
    updateRunningSessionRaceMode
}