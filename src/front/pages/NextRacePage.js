import React, {useEffect, useState} from 'react'

const NextRacePage = ({socket}) => {
    const [session, setSession] = useState(null);
    const [alert] = useState("")
    const [lastCallMessage, setLastCallMessage] = useState(false)
    useEffect(() => {
        socket.emit("get_next_session")
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on("next_session", (data) => {
            console.log("next session data")
            console.log(data)
            if (data) {
                console.log("seting session")
                setSession(data)
            } else {
                setSession(null)
            }
            console.log(session)
        })
        socket.on("last_call_message", (data) => setLastCallMessage(data))
        return () => {
            socket.off("next_session")
            socket.off("last_call_message")
        }
        // eslint-disable-next-line
    }, [socket]);
    return (
        <div className="fullscreenDiv">
            <div className="container d-flex flex-column justify-content-center align-items-center mt-5">
                {alert && <div className="alert alert-danger w-100">{alert}</div>} {/* Display error messages */}
                {session ? (
                    <div className="card shadow-lg p-4">
                        {lastCallMessage && (
                            <div className="alert alert-warning text-center">
                                Proceed to the paddock
                            </div>
                        )}
                        <h2 className="card-title text-center mb-4">Next Starting Session</h2>
                        <div className="card-body">
                            {/*<p><strong>ID:</strong> {session.id}</p>*/}
                            {/*<p><strong>Name:</strong> {session.name}</p>*/}
                            <p><strong>Starts at:</strong> {new Date(session.startTime).toLocaleString()}</p>
                            <p><strong>Duration:</strong> {session.duration} minutes</p>
                            <h5 className="mt-4">Drivers</h5>
                            <ul className="list-group">
                                {session.drivers && session.drivers.length > 0 ? (
                                    session.drivers.map((driver, index) => (
                                        <li key={index} className="list-group-item">
                                            <strong>Driver:</strong> {driver.name}
                                            <strong> Car:</strong> {driver.carNumber}
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-group-item text-muted">No drivers available.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted">No Races</p>
                )}
            </div>
        </div>
    )
}

export default NextRacePage