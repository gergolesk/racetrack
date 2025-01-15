import React, {useEffect, useState} from "react";
import {Alert, Card, Col, Container, Row} from "react-bootstrap";

function LapLineTracker({socket}) {
    const [cars, setCars] = useState([]); // List of cars
    const [hideButtons, setHideButtons] = useState(false);
    const [lastLap, setLastLap] = useState(null);
    // once on startup
    useEffect(() => {
        socket.emit("request-init-cars");
        socket.emit("request_last_lap")
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        // Get initial list of cars
        socket.on("init-cars", (cars) => {
            setCars(cars);
        });

        // Update cars data
        socket.on("update-car", (updatedCar) => {
            setCars((prevCars) =>
                prevCars.map((car) =>
                    car.number === updatedCar.number
                        ? {
                            ...car,
                            fastestLap: updatedCar.fastestLap,
                            currentLap: updatedCar.currentLap,
                        }
                        : car
                )
            );
        });

        socket.on("last_lap", (lastLap) => {
            console.log("Last lap")
            setLastLap(lastLap)
        })

        socket.on("last_call_message", (data) => {
            setHideButtons(data);
        });

        return () => {
            socket.off("init-cars");
            socket.off("update-car");
            socket.off("last_lap");
            socket.off("last_call_message");
        };
    }, [socket]);

    // Button handler
    const handleLapCross = (carNumber) => {
        const timestamp = Date.now();
        setCars((prevCars) =>
            prevCars.map((car) =>
                car.number === carNumber
                    ? {
                        ...car,
                        currentLap: (car.currentLap || 0) + 1,
                        driveEnded: lastLap
                    }
                    : car
            )
        );
        socket.emit("lap-cross", {carNumber, timestamp});
    };

    return (
        <Container className="mt-4">
            <h1 className="text-center mb-4">Lap Line Tracker</h1>
            {hideButtons && <Alert variant="danger">Race over</Alert>}
            {!hideButtons && (
                <>
                    {cars.length <= 0 ? (
                        <Alert variant="warning">No cars available</Alert>
                    ) : (
                        <Row className="g-4">
                            {cars.map((car) => (
                                <Col key={car.number} xs={6} lg={3}>
                                    <Card
                                        className="shadow h-100"
                                        onClick={() => car.driveEnded ? null : handleLapCross(car.number)}
                                        style={{
                                            cursor: "pointer",
                                            backgroundColor: !car.driveEnded ? "#32CD32" : "black"
                                        }}
                                    >
                                        <Card.Body>
                                            <Card.Title style={{fontSize: "18px"}}>Car: <span
                                                style={{fontSize: "30px"}}>#{car.number}</span></Card.Title>
                                            <Card.Text>
                                                <strong>Lap:</strong> {car.currentLap || 0} <br/>
                                                <strong>Fastest
                                                    Lap:</strong> {car.fastestLap ? `${car.fastestLap} ms` : "N/A"}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
}

export default LapLineTracker;
