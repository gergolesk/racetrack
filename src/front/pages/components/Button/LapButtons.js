import React from 'react';

const LapButtons = ({car, onClick, disabled}) => {
    return (
        <div style={styles.container}>
            <button key={car.number}
                    onClick={!disabled ? onClick : undefined}
                    style={styles.button}
            >
                <div style={styles.carInfo}>
                    <span style={styles.driverName}>{car.name}</span>
                    <span style={styles.carNumber}>#{car.number}</span>
                </div>
            </button>
        </div>
    );
};

const styles = {
    container: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "15px",
        padding: "20px",
    },
    button: {
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "10px",
        padding: "20px",
        fontSize: "18px",
        cursor: "pointer",
        width: "90%",
        height: "100px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        texAlign: "center",
        transition: "transform 0.2s, background-color 0.3s",
    },
    carInfo: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    driverName: {
        fontWeight: "bold",
        marginBottom: "8px",
    },
    carNumber: {
        fontSize: "24px",
    }
}

export default LapButtons;