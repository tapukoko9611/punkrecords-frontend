import { useEffect, useState } from "react";



// export default function Home3 () {
//     const [ count, setCount ] = useState(0);

//     return (
//         <div>
//             <button onClick={ () => setCount(prevCount => prevCount+1) }>{count}</button>
//         </div>
//     );
// }


export default function Home3 () {
    const [ name, setName ] = useState({ firstName: '', lastName: ''});

    useEffect(() => {
        document.title = name.firstName
    }, [name.lastName]);

    return (
        <div>
            <input type="text" value={name.firstName} onChange={ e => setName({...name, firstName: e.target.value})} placeholder="first name" />
            <input type="text" value={name.lastName} onChange={ e => setName({...name, lastName: e.target.value})} placeholder="last name" />
        </div>
    );
}