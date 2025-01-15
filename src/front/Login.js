import {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import Button from "./pages/components/Button/Button";
import {Alert, Card, Form} from "react-bootstrap";

const userTypes = ["RECEPTIONIST", "OBSERVER", "SAFETY"];
const userTypeKeys = {
    RECEPTIONIST: "RECEPTIONIST_KEY",
    OBSERVER: "OBSERVER_KEY",
    SAFETY: "SAFETY_KEY"
};


function Login({socket}) {
    const userTypeRef = useRef(null)
    const passwordRef = useRef(null)
    const navigate = useNavigate()
    const [error, setError] = useState('')

    function signIn() {
        const userData = {
            user: userTypeRef.current.value,
            password: passwordRef.current.value
        }

        if (!userData.user || !userData.password) {
            setError("Please select a user type and enter a password.");
            return;
        }

        socket.emit("validate_access_key", userData, (response) => {
            if (response.success) {
                sessionStorage.setItem("accessKey", response.message);
                navigate("/");
            } else {
                setError("Access key not correct")
            }
        })
    }

    return (
        <div className="d-flex justify-content-center align-items-center mt-5">
            <Card style={{width: "24rem"}} className="shadow">
                <Card.Body>
                    <Card.Title className="text-center mb-4">Log In</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        signIn();
                    }}>
                        <Form.Group className="mb-3" controlId="user">
                            <Form.Label>Select User Type</Form.Label>
                            <Form.Select ref={userTypeRef}>
                                {userTypes.map(userType => (
                                    <option key={userType} value={userTypeKeys[userType]}>
                                        {userType}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                ref={passwordRef}
                                type="password"
                                placeholder="Enter your password"
                            />
                        </Form.Group>

                        <div className="d-grid">
                            <Button type="submit" variant="primary">
                                Log In
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Login;