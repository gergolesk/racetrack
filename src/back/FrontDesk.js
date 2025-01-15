const {
    saveSessionsToFile,
    getAllSessions,
    getNextSession,
    addSession,
    updateSession,
    deleteSession, hasComingOrRunningRace
} = require("./RaceSession");

const frontDesk = (socket, io) => {
    function saveAndSendRaceSessions() {
        console.log("save sessions to file")
        saveSessionsToFile()
        const next = getNextSession() || []
        const all = getAllSessions()
        const showRaceControl = hasComingOrRunningRace()
        console.log("Show race control is set to " + showRaceControl)
        console.log("Next session" + next)
        io.emit("receive_session", all);
        io.emit("next_session", next)
        io.emit("has_coming_running_race", showRaceControl)
    }

    socket.on("get_all_sessions", () => {
        io.emit("receive_session", getAllSessions());
    })

    socket.on("add_session", (data) => {
        addSession(data)
        saveAndSendRaceSessions()
    })

    socket.on("update_session", (data) => {
        updateSession(data)
        saveAndSendRaceSessions()
    });

    socket.on("delete_session", (id) => {
        console.log("Delete session with id:" + id)
        deleteSession(id)
        saveAndSendRaceSessions()
    })
};

module.exports = frontDesk