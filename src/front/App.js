import './App.css';
import {Container, Nav, Navbar} from 'react-bootstrap';
import io from 'socket.io-client';
import {Link, Route, Routes, useNavigate} from 'react-router-dom';
import {useEffect, useState} from "react";
import Login from "./Login";
import {RaceControlPage} from "./pages/RaceControlPage";
import FrontDeskPage from "./pages/FrontDeskPage";
import {SessionProvider} from "./pages/components/SessionContext";
import NextRacePage from "./pages/NextRacePage";
import RaceCountdownPage from "./pages/RaceCountdownPage";
import FullscreenButton from "./pages/components/Button/FullscreenButton";
import RaceFlagsPage from "./pages/RaceFlagsPage";
import LapLineTrackerPage from './pages/LapLineTrackerPage';
import MainPage from "./pages/MainPage";
import LeaderboardPage from "./pages/LeaderboardPage";

const socket = io(process.env.REACT_APP_SOCKET_SERVER_URL, {
    transports: ["websocket", "polling"]
});


function App() {
    const [employee, setEmployee] = useState(null)
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate()


    useEffect(() => {
        const authData = sessionStorage.getItem("accessKey");

        if (authData) {
            setEmployee(authData);
        }
    }, [employee, navigate]);

    function logout() {
        sessionStorage.removeItem("accessKey");
        setEmployee(null);
        navigate("/");
        setExpanded(false);
    }

    function handleNavClick() {
        setExpanded(false);
    }

    return (
        <SessionProvider socket={socket}>
            <div className="App">
                <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect expanded={expanded}
                        onToggle={() => setExpanded(!expanded)}>
                    <Container>
                        <Navbar.Brand as={Link} to="/">RaceTrack</Navbar.Brand>

                        <Navbar.Toggle aria-controls="navbar-nav"/>

                        <Navbar.Collapse id="navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link as={Link} to="/leader-board" onClick={handleNavClick}>Leader Board</Nav.Link>
                                <Nav.Link as={Link} to="/next-race" onClick={handleNavClick}>Next Race</Nav.Link>
                                <Nav.Link as={Link} to="/race-countdown" onClick={handleNavClick}>Race
                                    Countdown</Nav.Link>
                                <Nav.Link as={Link} to="/race-flags" onClick={handleNavClick}>Race Flags</Nav.Link>

                                {/*when div with className="fullscreenDiv"> a button is shown to make the div fullscreen*/}
                                <FullscreenButton/>
                            </Nav>

                            <Nav className="me-right">
                                {employee === "receptionist" &&
                                    <Nav.Link as={Link} to="/front-desk" onClick={handleNavClick}>Front Desk</Nav.Link>}
                                {employee === "safety" &&
                                    <Nav.Link as={Link} to="/race-control" onClick={handleNavClick}>Race
                                        Control</Nav.Link>}
                                {employee === "observer" &&
                                    <Nav.Link as={Link} to="/lap-line-tracker" onClick={handleNavClick}>Lap Line
                                        Tracker</Nav.Link>}

                                {!employee ? (
                                    <Nav.Link as={Link} to="/login" onClick={handleNavClick}>Log in</Nav.Link>
                                ) : (
                                    <Nav.Link onClick={() => logout()}>Log out</Nav.Link>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <Routes>
                    <Route path='/' exact element={<MainPage socket={socket}/>}/>
                    {employee === "receptionist" &&
                        <Route path='front-desk' exact element={<FrontDeskPage socket={socket}/>}/>}
                    {employee === "safety" &&
                        <Route path='race-control' exact element={<RaceControlPage socket={socket}/>}/>}
                    {employee === "observer" &&
                        <Route path='lap-line-tracker' exact element={<LapLineTrackerPage socket={socket}/>}/>}
                    <Route path='race-countdown' exact element={<RaceCountdownPage socket={socket}/>}/>
                    <Route path='login' exact element={<Login socket={socket}/>}/>
                    <Route path='next-race' exact element={<NextRacePage socket={socket}/>}/>
                    <Route path='race-flags' exact element={<RaceFlagsPage socket={socket}/>}/>
                    <Route path='leader-board' exact element={<LeaderboardPage socket={socket}/>}/>

                </Routes>
            </div>
        </SessionProvider>
    );
}

export default App;