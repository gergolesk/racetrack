import {useEffect, useState} from 'react';
import {useSession} from "./components/SessionContext";
import Button from "./components/Button/Button";
import {Card} from "react-bootstrap";

function FrontDeskPage({socket}) {

    const raceTime = process.env.NODE_ENV === "development" ? 1 : 10
    const maxDrivers = parseInt(process.env.REACT_APP_MAX_DRIVERS, 10) || 8
    const intervalTime = parseInt(process.env.REACT_APP_INTERVAL_ENV, 10) || 5

    const currentTimePlusMin = new Date()
    currentTimePlusMin.setMinutes(currentTimePlusMin.getMinutes() + intervalTime)

    const [sessions, setSessions] = useSession()
    const [drivers, setDrivers] = useState(
        Array.from({length: maxDrivers},
            () => ({name: '', carNumber: ''})))
    const [sessionDate, setSessionDate] = useState(currentTimePlusMin.toISOString().split('T')[0])
    const [sessionTime, setSessionTime] = useState(currentTimePlusMin.toTimeString().slice(0, 5))
    const [editingSession, setEditingSession] = useState(null)
    const [error, setError] = useState('')
    useEffect(() => {
        socket.emit("get_all_sessions")
        // eslint-disable-next-line
    }, [])
    useEffect(() => {
        const handleReceiveSession = (sessions) => {
            if (sessions && sessions.length > 0) {
                setSessions(sessions);
            } else {
                setSessions([])
            }
        }
        const handleSessionError = (error) => {
            setError(error.message); // Set the error message for display
        }

        socket.on("receive_session", handleReceiveSession)
        socket.on("session_error", handleSessionError)

        return () => {
            socket.off("receive_session")
            socket.off("session_error")
        }
    }, [setSessions, socket])

    const createOrUpdateSession = () => {
        const sessionStartTime = new Date(`${sessionDate}T${sessionTime}`)
        if (sessionStartTime < new Date()) {
            setError("The start time cannot be in the past")
            return;
        }
        const filledDrivers = drivers.filter(driver => driver.name.trim() !== '')

        //create session with data
        const sessionData = {
            startTime: sessionStartTime.toISOString(),
            hasStarted: false,
            hasFinished: false,
            drivers: filledDrivers.map(driver => ({
                name: driver.name.trim(),
                carNumber: driver.carNumber, // Ensure carNumber is included
                laps: 0,
                fastestLap: 0
            }))
        }

        //if session drivers empty stop
        if (sessionData.drivers.length === 0) {
            setError('At least one driver is required.');
            return;
        }
        checkDriverAndCarUnique()
        if (editingSession !== null) {
            socket.emit("update_session", {id: editingSession, sessionData});
            setEditingSession(null)
        } else {
            console.log("add session")
            socket.emit("add_session", sessionData)
        }

        sessionStartTime.setMinutes(sessionStartTime.getMinutes() + raceTime + intervalTime)
        setSessionTime(sessionStartTime.toTimeString().slice(0, 5))
        setDrivers(Array.from({length: maxDrivers}, () => ({name: '', carNumber: ''})))
        setError('')
    }

    const checkDriverAndCarUnique = () => {
        let checkedDrivers = new Set()
        for (const driver of drivers.filter(driver => driver.name !== "")) {
            if (checkedDrivers.has(driver.name)) {
                return false
            } else {
                checkedDrivers.add(driver.name)
            }
        }
        return true
    }

    // on changing the name field
    const handleDriverChange = (index, value) => {
        const newDrivers = [...drivers]
        newDrivers[index]['name'] = value
        newDrivers[index]['carNumber'] = index + 1

        setDrivers(newDrivers)
        setError('') // Clear error when user starts typing
    };

    function enableCreateRaceBtn() {
        return drivers.some(driver => driver.name.trim() !== '')
    }

    // leaving the name field
    const handleDriverBlur = () => {
        if (!checkDriverAndCarUnique()) {
            setError(`All driver name must by unique.`)
        } else {
            setError('') // Clear error if unique
        }
    };

    const getUpcomingSessions = () => {
        if (!sessions) return

        return sessions
            .filter(session => !session.hasStarted)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)); // Sort by startTime
    };

    function editRace(session) {
        const raceDate = new Date(session.startTime)
        // Set the current session data to state for editing
        setSessionDate(raceDate.toISOString().split('T')[0]);
        setSessionTime(raceDate.toTimeString().slice(0, 5));

        const newDrivers = Array.from({length: maxDrivers},
            (_, index) => ({name: '', carNumber: index + 1}))

        newDrivers.forEach((driver) => {
            const foundDriver = session.drivers.find(d => d.carNumber === driver.carNumber)
            if (foundDriver) {
                driver.name = foundDriver.name
            }
        })
        setDrivers(newDrivers)
        setError('')
        setEditingSession(session.id)
    }

    function deleteRace(id) {
        console.log(id)
        socket.emit("delete_session", id)
    }

    function raceTimeField() {
        return <div className="mb-3">
            <label className="form-label" htmlFor="raceTime">Race Start Time: </label>
            <input
                className="form-control"
                type="time"
                id="raceTime"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                required
            />
        </div>;
    }

    function driverFields() {
        return <>
            {[...Array(maxDrivers)].map((_, index) => (
                <div key={index} className="row mb-2">
                    <div className="col-auto">
                        Car {index + 1}
                    </div>
                    <div className="col">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Driver Name"
                            value={drivers[index].name || ''}
                            onChange={(e) => handleDriverChange(index, e.target.value)}
                            //after leaving field
                            onBlur={() => handleDriverBlur()}
                        />
                    </div>
                </div>
            ))}
        </>
    }

    function raceDateField() {
        return <div className="mb-3">
            <label className="form-label" htmlFor="raceDate">Race Date: </label>
            <input
                className="form-control"
                type="date"
                id="raceDate"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
            />
        </div>;
    }

    function manageRace() {
        return <div className="card p-4 mb-4 shadow-lg">
            <h2 className="card-title">Create Race</h2>
            {raceDateField()}
            {raceTimeField()}
            {driverFields()}
            <br/>
            <Button onClick={createOrUpdateSession} disabled={!enableCreateRaceBtn() || error !== ""}
                    className="btn createBtn">
                {editingSession !== null ? "Update Race" : "Create Race"}
            </Button>
        </div>;
    }

    function upcomingRacesList() {
        const upcomingSessions = getUpcomingSessions();

        return (
            <div className="mt-4 mb-5">
                <h2 className="text-center mb-4">Races List</h2>
                <div className="d-flex flex-wrap gap-4 justify-content-center">
                    {upcomingSessions && upcomingSessions.length > 0 ? (
                        upcomingSessions.map((race) => (
                            <Card key={race.id} className="shadow-lg d-flex flex-column" style={{width: '18rem'}}>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>Race Details</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        Start Time: {new Date(race.startTime).toLocaleString()}
                                    </Card.Subtitle>
                                    <Card.Text>
                                        <strong>Drivers:</strong><br/>
                                        {race.drivers.length > 0
                                            ? race.drivers.map(driver => (
                                                <span key={driver.carNumber}>
                                    {driver.name} (Car: {driver.carNumber})<br/>
                                </span>
                                            ))
                                            : <span>No drivers available</span>}
                                    </Card.Text>
                                    <div className="mt-auto d-flex justify-content-between">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => editRace(race)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => deleteRace(race.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted">No upcoming races available.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4 " style={{backgroundColor: error ? 'red' : "transparent"}}>
            <h1 className="text-center mb-4">Race Management</h1>
            {error &&
                <div className="alert alert-danger">{error}</div>
            }
            {manageRace()}
            {upcomingRacesList()}
        </div>
    );
}

export default FrontDeskPage;