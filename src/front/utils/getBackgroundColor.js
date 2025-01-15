export const getBackgroundColor = (raceMode) => {
    switch (raceMode) {
        case "Safe":
            return "green";
        case "Hazard":
            return "yellow";
        case "Danger":
            return "red";
        case "Finish":
            return "repeating-conic-gradient(black 0% 25%, white 0% 50%)";
        default:
            return "white";
    }
};