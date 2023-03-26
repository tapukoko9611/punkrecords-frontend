import { useReducer, useState } from "react";

// const initState = 0;
// const reducer = (state, action) => {
//     switch (action) {
//         case 'INC': return state+1;
//         case 'DEC': return state-1;
//         case 'RES': return initState;
//         default: return state;
//     }
// }

// function Home5 () {
    
//     const [ count, dispatch ] = useReducer(reducer, initState);

//     return (
//             <center>
//                 <div>
//                     {count}
//                     <div>
//                         <button onClick={() => dispatch('INC')}>+</button>
//                         <button onClick={() => dispatch('DEC')}>-</button>
//                         <button onClick={() => dispatch('RES')}>0</button>
//                         <button onClick={() => dispatch('')}>+0</button>
//                     </div>
//                 </div>
//             </center>
//     )
// }

function Home5 () {

    const initState = {firstName: "", lastName: ""};
    const reducer = (state, action) => {
        switch (action) {
            case "FIRST":
                return {
                    ...state,
                    firstName: ip
                };
            case "LAST":
                return {
                    ...state,
                    lastName: ip
                };
            case "INIT":
                return initState;
            default:
                return state;
        }
    }

    const [ ip, setIp ] = useState("");
    const [ state, dispatch ] = useReducer(reducer, initState);

    return (
        <center>
            <div>
                <h3>You are {state.firstName} {state.lastName}</h3>
                <input type="text" value={ip} onChange={e => setIp(e.target.value)} />
                <button onClick={() => dispatch('FIRST')}>set First Name</button>
                <button onClick={() => dispatch('LAST')}>set Last Name</button>
                <button onClick={() => dispatch('INIT')}>Reset</button>
            </div>
        </center>
    )
}

export default Home5;