import { createContext, useState } from "react";

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [ auth, setAuth ] = useState({
        user: null,
        token: null,
    });

    return (
        <AuthContext.Provider value={{ auth: auth, setAuth: setAuth }} >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;

export { AuthContextProvider };