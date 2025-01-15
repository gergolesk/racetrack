const {
    startNextSession,
    finishRunningSession,
    getNextSession,
    getAllSessions,
    hasComingOrRunningRace,
    getRunningSession,
    getSessionDuration,
    updateRunningSessionRemainingTime, updateRunningSessionRaceMode
} = require("./RaceSession");
let raceMode = "Danger";
let raceTimer = null;
let remainingTime = 0;
let isRaceRunning = false;

const raceControl = (socket, io) => {
    const runningSession = getRunningSession()
    if (runningSession) {
        if (runningSession.timeRemaining)
            remainingTime = runningSession.timeRemaining
        if (runningSession.raceMode)
            raceMode = runningSession.raceMode
        startRace()
    }

    // Отправка текущего состояния гонки всем клиентам
    const broadcastRaceState = () => {
        io.emit("race_state", {raceMode, remainingTime, isRaceRunning});
        updateRunningSessionRaceMode(raceMode)
        updateRunningSessionRemainingTime(remainingTime)
    };

    // Завершить гонку (Finish) и проверить наличие следующей
    const finishRace = () => {
        finishRunningSession();
        io.emit("last_call_message", true);
        io.emit("receive_session", getAllSessions());
        io.emit("next_session", getNextSession());
        io.emit("has_coming_running_race", hasComingOrRunningRace());
    };

    // Обработка команды "set_race_mode"
    socket.on("set_race_mode", (mode) => {
        if (["Safe", "Hazard", "Danger", "Finish"].includes(mode)) {
            raceMode = mode;
            if (mode === "Finish") {
                // Остановка таймера и перевод гонки в режим Finish
                if (raceTimer) {
                    clearInterval(raceTimer);
                    raceTimer = null;
                }
                remainingTime = 0;
                isRaceRunning = false;
            }
            io.emit("last_lap", raceMode === "Finish")
            broadcastRaceState();
        }
    });
    socket.on("request_last_lap", () => {
        io.emit("last_lap", raceMode === "Finish")
    })


    function startRace() {
        if (raceTimer) {
            console.warn("race already running")
            return
        } // Если таймер уже запущен, игнорируем
        if (!runningSession) {
            remainingTime = getSessionDuration() * 60
            raceMode = "Safe"  // Зелёный флаг
        } else {
            remainingTime = runningSession.timeRemaining || getRunningSession() * 60
            raceMode = runningSession.raceMode || "Safe"
        }

        startNextSession();
        io.emit("receive_session", getAllSessions());
        io.emit("next_session", getNextSession());
        io.emit("last_call_message", false);

        isRaceRunning = true;

        // Запуск обратного отсчёта
        raceTimer = setInterval(() => {
            remainingTime -= 1;
            broadcastRaceState();

            if (remainingTime <= 0) {
                clearInterval(raceTimer);
                raceTimer = null;
                raceMode = "Finish";
                isRaceRunning = false;
                broadcastRaceState();
            }
        }, 1000);
    }

// Запуск новой гонки
    socket.on("start_race", () => {
        startRace();
    });

    // Полная остановка гонки (Stop Race)
    socket.on("stop_race", () => {
        if (raceTimer) {
            clearInterval(raceTimer);
            raceTimer = null;
        }
        remainingTime = 0; // Обнуляем время
        isRaceRunning = false;
        raceMode = "Danger"; // Красный флаг
        finishRace(); // Проверка на наличие следующих гонок
        broadcastRaceState();
    });

    socket.on('start_countdown', (data) => {
        io.emit('start_countdown', data); // Рассылаем всем клиентам
    });

    socket.on('stop_countdown', () => {
        io.emit('stop_countdown'); // Рассылаем всем клиентам
    });

    // Проверка на наличие следующих гонок
    socket.on("get_coming_running_race", () => {
        socket.emit("has_coming_running_race", hasComingOrRunningRace());
    });

    socket.on("get_race_state", () => {
        socket.emit("race_state", {raceMode, remainingTime, isRaceRunning});
    });
};

module.exports = raceControl;
