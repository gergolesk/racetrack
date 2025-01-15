import {useEffect} from "react";
import {useSession} from "./components/SessionContext";
import {Card, Col, Container, Row} from "react-bootstrap";

function MainPage({socket}) {
    const [sessions, setSessions] = useSession([]);

    useEffect(() => {
        socket.emit("get_all_sessions");
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        socket.on("all_sessions", (data) => {
            if (Array.isArray(data)) {
                setSessions(data);
            } else {
                console.error("Received data is not an array:", data);
            }
        });
        // eslint-disable-next-line
    }, [socket]);

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">Races List</h2>
            <Row className="g-4">
                {sessions && sessions.map((race, index) => (
                    <Col key={index} xs={12} sm={6} md={4} lg={3}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title className="text-center mb-3">Race {index + 1}</Card.Title>
                                <Card.Text>
                                    <strong>Start Time:</strong> {new Date(race.startTime).toLocaleString()}<br/>
                                    <span style={{color: race.hasStarted ? "green" : "red"}}>
                                            <strong>
                                                Started: {" "}
                                            </strong>
                                        {race.hasStarted ? "Yes" : "No"}
                                        </span>
                                    <br/>
                                    <>Remaining time: {race.timeRemaining}</>
                                    <br/>
                                    <>Race Mode: {race.raceMode}</>
                                    <br/>
                                    <span style={{color: race.hasFinished ? "green" : "red"}}>
                                            <strong>
                                                Finished:{" "}
                                            </strong>
                                        {race.hasFinished ? "Yes" : "No"}
                                        </span>
                                    <br/>
                                </Card.Text>
                                <hr/>
                                <div>
                                    <h6 className="mb-2">Drivers:</h6>
                                    {race.drivers.length > 0 ? (
                                        <ul className="list-unstyled">
                                            {race.drivers.map((driver, idx) => (
                                                <li key={idx} className="mb-1">
                                                    <strong>{driver.name}</strong> (Car: {driver.carNumber},
                                                    Time: {driver.fastestLap} ms)
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted">No drivers available</p>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default MainPage;
