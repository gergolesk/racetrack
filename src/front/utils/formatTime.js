export const formatTime = (remainingTime) => {
    const minutes = Math.floor(remainingTime / 60).toString().padStart(2, "0");
    const seconds = (remainingTime % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
};