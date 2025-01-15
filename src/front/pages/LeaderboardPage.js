import React, {useEffect, useState} from "react";
import {getBackgroundColor} from "../utils/getBackgroundColor";
import {formatTime} from "../utils/formatTime";

function LeaderboardPage({socket}) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [remainingTime, setRemainingTime] = useState(0);
    const [raceMode, setRaceMode] = useState("Danger");

    useEffect(() => {
        socket.emit('request-init-cars'); // Запрос данных при подключении
        // eslint-disable-next-line
    }, [])// [] run once

    useEffect(() => {
        //Loading initial data
        socket.on('leaderboard-init', (data) => {
            setLeaderboard(data.leaderboard);
            setRemainingTime(data.remainingTime);
            setRaceMode(data.raceMode);
        });


        socket.on('init-cars', (data) => {
            setLeaderboard(data.map(car => ({
                ...car,
                currentLap: car.currentLap || 0,
                fastestLap: car.fastestLap || null
            })));
        });

        socket.on("race_state", (data) => {
            setRemainingTime(data.remainingTime);
            setRaceMode(data.raceMode);
        })

        //Listen for updates
        socket.on('leaderboard-update', (updatedLeaderboard) => {
            setLeaderboard(updatedLeaderboard);
            console.log(updatedLeaderboard);
        });

        return () => {
            socket.off('leaderboard-init');
            socket.off('race_state');
            socket.off('init-cars');
            socket.off('leaderboard-update');
        };
    }, [socket]);

    return (
        <div className="fullscreenDiv">
            <h1>Leaderboard</h1>
            {leaderboard.length > 0 && <div>
                <h3>Remaining Time: {formatTime(remainingTime)}</h3>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}><h3>Current
                    flag:</h3>
                    <div style={{
                        backgroundColor: raceMode === "Finish" ? undefined : getBackgroundColor(raceMode),
                        backgroundImage: raceMode === "Finish" ? getBackgroundColor(raceMode) : undefined,
                        height: "50px",
                        width: "50px",
                        border: "1px solid black",
                        marginBottom: "10px"
                    }}/>
                </div>
            </div>}
            {leaderboard.length === 0 ? (
                <div style={{textAlign: 'center', padding: '8px'}}>
                    No data available
                </div>
            ) : (
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                    <tr>
                        <th style={{border: '1px solid black', padding: '8px'}}>Position</th>
                        <th style={{border: '1px solid black', padding: '8px'}}>Car Number</th>
                        <th style={{border: '1px solid black', padding: '8px'}}>Driver Name</th>
                        <th style={{border: '1px solid black', padding: '8px'}}>Fastest Lap (ms)</th>
                        <th style={{border: '1px solid black', padding: '8px'}}>Current Lap</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leaderboard.map((car, index) => (
                        <tr key={car.number}>
                            <td style={{border: '1px solid black', padding: '8px'}}>{index + 1}</td>
                            <td style={{border: '1px solid black', padding: '8px'}}>{car.number}</td>
                            <td style={{border: '1px solid black', padding: '8px'}}>{car.name}</td>
                            <td style={{border: '1px solid black', padding: '8px'}}>
                                {car.fastestLap ? `${car.fastestLap} ms` : 'N/A'}
                            </td>
                            <td style={{border: '1px solid black', padding: '8px'}}>
                                {car.currentLap}
                            </td>
                        </tr>
                    ))
                    }
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default LeaderboardPage;