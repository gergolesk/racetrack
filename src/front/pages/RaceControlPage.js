import {useEffect, useState} from "react";
import RaceFlagsPage from "./RaceFlagsPage";
import Button from "./components/Button/Button";
import {formatTime} from "../utils/formatTime";
import CountdownModal from "./components/CountdownModal";

export function RaceControlPage({socket}) {
    const [raceMode, setRaceMode] = useState("Danger"); // Текущий флаг гонки
    const [remainingTime, setRemainingTime] = useState(0); // Оставшееся время
    const [isRaceRunning, setIsRaceRunning] = useState(false); // Идёт ли гонка
    const [showControl, setShowControl] = useState(true); // Есть ли следующая гонка
    const [isFinishMode, setIsFinishMode] = useState(false); // Режим Finish
    const [nextSession, setNextSession] = useState(null); // Информация о следующей сессии
    const [showCountdown, setShowCountdown] = useState(false); // Состояние для показа Pop-up
    useEffect(() => {
        socket.emit("get_coming_running_race");
        socket.emit("get_next_session");
        // eslint-disable-next-line
    }, []);

    // Получение информации о следующей сессии
    useEffect(() => {
        socket.on("has_coming_running_race", (data) => {
            setShowControl(data);
        });

        socket.on("next_session", (data) => {
            setNextSession(data);
        });

        socket.on("race_state", (data) => {
            setRaceMode(data.raceMode);
            setRemainingTime(data.remainingTime);
            setIsRaceRunning(data.isRaceRunning);

            // Проверяем, включён ли режим Finish
            if (data.raceMode === "Finish") {
                setIsFinishMode(true);
            } else {
                setIsFinishMode(false);
            }
        });

        return () => {
            socket.off("next_session");
            socket.off("race_state");
            socket.off("has_coming_running_race");
        };
    }, [socket]);

    const startRace = () => {
        socket.emit('start_countdown', {start: 5});
        setShowCountdown(true); // Показываем обратный отсчёт
    };

    const handleCountdownFinish = () => {
        socket.emit('stop_countdown');
        setShowCountdown(false);
        socket.emit("start_race");
        setIsRaceRunning(true);
        setIsFinishMode(false);
    };

    const stopRace = () => {
        socket.emit("stop_race");
        setIsRaceRunning(false);
        setIsFinishMode(false);
    };

    function emitRaceMode(mode) {
        socket.emit("set_race_mode", mode);
    }

    return (
        <div className="race-control">
            {showControl ? (
                <div>
                    {showCountdown && (
                        <CountdownModal startCount={5} onCountdownFinish={handleCountdownFinish}/>
                    )}

                    <h1>Race Control</h1>
                    <h2>Race Mode: {raceMode}</h2>
                    <h2>Time Remaining: {formatTime(remainingTime)}</h2>

                    {/* Если следующая сессия доступна */}
                    {nextSession && (
                        <div style={{marginBottom: "10px", textAlign: "center"}}>
                            <h3>Next Session:</h3>
                            <p>
                                <strong>Date:</strong> {new Date(nextSession.startTime).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Time:</strong> {new Date(nextSession.startTime).toLocaleTimeString()}
                            </p>
                        </div>
                    )}

                    {/* Кнопки управления */}
                    <div style={{display: "flex", justifyContent: "center", gap: "5px", marginBottom: "10px"}}>
                        <Button onClick={() => emitRaceMode("Safe")}
                                disabled={!isRaceRunning || isFinishMode}>
                            Safe
                        </Button>
                        <Button onClick={() => emitRaceMode("Hazard")}
                                disabled={!isRaceRunning || isFinishMode}>
                            Hazard
                        </Button>
                        <Button onClick={() => emitRaceMode("Danger")}
                                disabled={!isRaceRunning || isFinishMode}>
                            Danger
                        </Button>
                        <Button onClick={() => emitRaceMode("Finish")}
                                disabled={!isRaceRunning || isFinishMode}>
                            Finish
                        </Button>
                    </div>

                    <div style={{display: "flex", justifyContent: "center", gap: "5px"}}>
                        <Button onClick={startRace} disabled={isRaceRunning || isFinishMode}>
                            Start Race
                        </Button>
                        <Button onClick={stopRace} disabled={!isFinishMode}>
                            Stop Race
                        </Button>
                    </div>
                </div>
            ) : (
                <h2 className="mt-5">No upcoming races</h2>
            )}


            <br/>
            <RaceFlagsPage socket={socket} raceMode={raceMode}/>
            <br/>
        </div>
    );
}
