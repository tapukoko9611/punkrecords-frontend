import { useContext, useState } from "react"
import AuthContext from "../actions/auth_context"

const Home4 = () => {

    const context = useContext(AuthContext);
    const [ user, setUser ] = useState();

    const login = () => {
        context.login({status: !context.status.status, user});
    }

    return (
        <div>
            {/* The below does not work */}
            {/* <button onClick={ () => context.login}>{context.status? "Authenticated": "Not Authenticated, Click to Authenticate"}</button> */}
            {!context.status.status && <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="enter name" />}
            <button onClick={login}>{context.status.status? "Sign Out": "Sign In"}</button>
            {context.status.status && <h2>{context.status.user}</h2>}
        </div>
    )
}

export default Home4;

// setState does not support callbacks