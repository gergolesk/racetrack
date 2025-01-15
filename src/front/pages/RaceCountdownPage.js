import React, {useEffect, useState} from 'react';
import CountdownModal from "./components/CountdownModal";

const RaceCountdownPage = ({socket}) => {
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdownStart, setCountdownStart] = useState(null);

    useEffect(() => {
        if (socket) {
            socket.on('start_countdown', (data) => {
                console.log('Starting countdown with:', data);
                setCountdownStart(data.start);
                setShowCountdown(true);
            });

            socket.on('stop_countdown', () => {
                console.log('Stopping countdown');
                setShowCountdown(false);
            });

            return () => {
                socket.off('start_countdown');
                socket.off('stop_countdown');
            };
        }
    }, [socket]);

    const handleCountdownFinish = () => {
        console.log("Countdown finished!");
        setShowCountdown(false);
    };

    return (
        <div>
            <div>
                Race Countdown
            </div>
            <div
                className="fullscreenDiv"
                style={{backgroundColor: "#000"}}
            >
                {showCountdown && (
                    <CountdownModal startCount={countdownStart || 5} onCountdownFinish={handleCountdownFinish}/>
                )}</div>
        </div>
    );
};

export default RaceCountdownPage;