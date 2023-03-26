import { createContext } from "react"


const authContext = createContext({
    status: null,
    login: () => {}
});

export default authContext;