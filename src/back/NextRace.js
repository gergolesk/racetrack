const {getNextSession, getAllSessions} = require("./RaceSession");

function nextRace(socket) {
    socket.on("get_next_session", () => {
        try {
            const nextRace = getNextSession();
            socket.emit("next_session", nextRace);
        } catch (error) {
            socket.emit("error", {message: "Failed to get next session."});
        }
    });

    socket.on("get_all_sessions", () => {
        try {
            const allSessions = getAllSessions();
            socket.emit("all_sessions", allSessions);
        } catch (error) {
            socket.emit("error", {message: "Failed to get all sessions."});
        }
    });
}

module.exports = nextRace;