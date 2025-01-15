import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {getBackgroundColor} from "../utils/getBackgroundColor";

function RaceFlagsPage({socket}) {
    const [raceMode, setRaceMode] = useState("");
    const location = useLocation();
    useEffect(() => {
        socket.emit("get_race_state");
        // eslint-disable-next-line
    }, [])

    useEffect(() => {

        socket.on("race_state", (data) => {
            setRaceMode(data.raceMode);
        });

        return () => {
            socket.off("race_state");
        };
    }, [socket]);


    const isFullScreen = location.pathname === "/race-flags";

    return (
        <div className="fullscreenDiv"
             style={{
                 backgroundColor: raceMode === "Finish" ? undefined : getBackgroundColor(raceMode),
                 backgroundImage: raceMode === "Finish" ? getBackgroundColor(raceMode) : undefined,
                 height: isFullScreen ? "calc(100vh - 56px)" : "300px",
                 width: "100%",
                 textAlign: "center",
                 border: "2px solid black",
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 backgroundSize: raceMode === "Finish" ? "200px 200px" : undefined,
             }}
        >
            <span
                style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(5px)",
                    padding: "10px 20px",
                    border: "1px solid black",
                    borderRadius: "10px",
                    fontSize: "2rem",
                    color: "black",
                    fontWeight: "bold",
                }}
            >
                {raceMode}
            </span>
        </div>
    );
}

export default RaceFlagsPage;

