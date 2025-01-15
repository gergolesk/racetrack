import React, {createContext, useContext, useEffect, useState} from 'react';

const SessionContext = createContext();

export const useSession = () => {
    const context = useContext(SessionContext);
    return [context.sessions, context.setSessions];
};

export const SessionProvider = ({socket, children}) => {

    const [sessions, setSessions] = useState([]);
    useEffect(() => {
        socket.emit("get_sessions");
        // eslint-disable-next-line
    }, [])
    useEffect(() => {
        const handleReceiveSession = (sessions) => {
            console.log("Sessions received:", sessions);
            setSessions(sessions);
        };

        socket.on("receive_session", handleReceiveSession);

        return () => {
            socket.off("receive_session", handleReceiveSession);
        };
    }, [socket]);

    return (
        <SessionContext.Provider value={{sessions, setSessions}}>
            {children}
        </SessionContext.Provider>
    );

};
