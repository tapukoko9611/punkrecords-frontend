import { useContext, useEffect, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

import AuthContext from "../context/auth-context";



// If something occurs, its becausee of async sto main function
// Just use useeEffectt hook isnide and inside it use async on function, not directly
const Storage = ({ socket }) => {
    const { auth, setAuth } = useContext(AuthContext);
    // let { storageId } = useParams();
    let storageId = "cns";

    const initState = {
        idatabase: [],
        iresult: [],
    };
    const reducer = (state, action) => {
        //console.log(Date.now().toLocaleString());
        //console.log(action.type);
        switch (action.type) {
            case "set result":
                return {
                    ...state,
                    iresult: action.payload,
                };
            case "init database":
                return {
                    idatabase: action.payload,
                    iresult: action.payload,
                }
            case "set database":
                return {
                    ...state,
                    idatabase: [...state.idatabase, action.payload],
                    iresult: [...state.idatabase, action.payload],
                }
            case "clear database":
                return initState;
            
        }
    }
    const [ state, dispatch ] = useReducer(reducer, initState);

    // const [ database, setDatabase ] = useState([]);
    const [ type, setType ] = useState("NONE"); // ADD UPDATE
    const [ name, setName ] = useState(""); // NAMING OF THE CURRENT TAB
    const [ inp, setInp ] = useState(""); // CONTENT OF THE CURRENT TAB
    const [ prevInp, setPrevInp ] = useState("");
    const [ search, setSearch ] = useState("");
    const [ session, setSession ] = useState("");
    const [ match, setMatch ] = useState(true);
    const [ change, setChange ] = useState();
    // socket.id

// TO GET THE DATA WHEN PAGE LOAADED
    useEffect(() => {
        (async () => {

            const config = {
                headers: {
                    Authorization: auth.token? `Bearer ${auth.token}`: '',
                },
            };

            await axios
                .get(`https://punkrecord-api.onrender.com/wtf/storage/${storageId}`, config)
                .then((data) => {
                    // console.log(data);
                    if (data.data.token) {
                        setAuth({
                            token: data.data.token,
                            user: data.data.session,
                        });
                    }
                    setSession(data.data.session);
                    setChange(data.data.session);
                    dispatch({
                        type: "init database", 
                        payload: data.data.database
                    });
                    //setDatabase(data.data.database);
                    //setResult(data.data.database);
                })
                .then(() => {
                    //console.log(auth);
                })
                .catch((err) => {
                    console.log(err.message);
                });
                socket.emit("join room", `storage-${storageId}`);
        })() //defines a function and calls it then and there itself. // See through that it donesn't return any shit 
            .catch((err) => {
                console.log(err.message);
            });

    }, [storageId]);


    // NOTIFY NEW CONNECTIONS
    useEffect(() => {
        socket.on("connections", (msg) => {
            console.log(msg);
        });
    }, []);

    useEffect(() => {
        socket.on("connectToRoom", (msg) => {
            console.log(msg);
        });
    }, []);

    // GET NEW CONTAINERS
    useEffect(() => {
        socket.on("new container", (msg) => {
            console.log("newcont");
            dispatch({
                type: "set database",
                payload: msg,
            });
            setSearch(search => search+" ");
        });
    }, []);

    const createData = async (event) => {
        if (search.trim()) {
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                };

                setInp("");
                const data = await axios.post(
                    `https://punkrecord-api.onrender.com/wtf/storage/${storageId}`,
                    {
                        data: "",
                        name: search.trim(),
                    },
                    config
                );
                
                //setDatabase([...database, data.data.data]);
                dispatch({
                    type: "set database", 
                    payload: data.data.data,
                });
                setName(data.data.data.name);
                setInp(data.data.data.data);
                setType("UPDATE");

                console.log("Emittted");
                socket.emit("new container", {...data.data.data, roomId: `storage-${storageId}`});
                //console.log(name, inp, type);
            }
            catch (err) {
                console.log(err.message);
            }
        }
    }


    // UPDATE EFFECT
    useEffect(() => {
        if(change===session) {
            update();
        }
    }, [inp])

    // GET NEW UPDATES
    useEffect(() => {
        // Socket.off().on() solved the infinite react loading problem
        //socket.off("update container").on("update container", (msg) => {
        //socket.removeListener("update container").on("update container", (msg) => {
        socket.off("update container").on("update container", (msg) => {
            const filteredData = state.idatabase.map(obj=> obj.name===msg.name ? {...obj, data: msg.data} : obj);
            dispatch({
                type: "init database",
                payload: filteredData,
            });
            console.log(name, msg.name, msg.data);
            if (name && name === msg.name) {
                console.log("Changing");
                setChange(msg.change);
                setPrevInp(inp);
                setInp(msg.data);
            }
        });
    });

    const update = async (event) => {
        if (name && 
            type==="UPDATE" 
        ) {
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                };

                // setInp("");
                const data = await axios.put(
                    `https://punkrecord-api.onrender.com/wtf/storage/${storageId}`,
                    {
                        data: inp,
                        name: name,
                    },
                    config
                );
                //console.log(data);
                
                const filteredData = state.idatabase.map(obj=> obj.name===data.data.data.name ? {...obj, data: data.data.data.data} : obj);
                //console.log(filteredData);
                //setDatabase(filteredData);
                dispatch({
                    type: "init database", 
                    payload: filteredData
                });

                //console.log("Being called multiple times??");
                socket.emit("update container", {...data.data.data, change: session, roomId: `storage-${storageId}`});
                //socket.emit("new container", {...data.data.data, roomId: `storage-${storageId}`});
                //setInp(state.idatabase.filter(e => e.name === name).data);
                //console.log(name, inp, type);

            }
            catch (err) {
                console.log(err.message);
            }
        }
    }
    

    // SEARCH EFFECT
    useEffect(() => {
        searched();
    }, [search]);

    const searched = (e) => {
        if (search && state.idatabase) {
            const res = state.idatabase.filter(e => e.name.toLowerCase().trim().includes(search.toLowerCase().trim()));
            dispatch({
                type: "set result", 
                payload: res
            });
            const mat = state.idatabase.filter(e => e.name.toLowerCase().trim()===search.toLowerCase().trim());
            //console.log(mat);
            if (mat.length===0) {
                setMatch(false);
            }
            else {
                setMatch(true);
            }
            if (!name && ((!match) || (state.res && state.res.length == 0))) {
                setInp("");
                setName("");
                setType("NONE");
            }
        }
        else {
            dispatch({
                type: "set result", 
                payload: state.idatabase
            });
        }
    }

    // CLEAR CHAT
    useEffect(() => {
        socket.on("clear store", (msg) => {
            dispatch({
                type: "clear database",
            });
            setName("");
            setInp("");
            setType("NONE");
            setSearch(" ");
        });
    }, []);

    const clearChat = async () => {
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
            };

            setInp("");
            const data = await axios.delete(
                `https://punkrecord-api.onrender.com/wtf/storage/${storageId}`,
                config
            );
            
            dispatch({
                type: "clear database",
            });
            setName("");
            setSearch("");
            setInp("");
            setType("NONE");
            socket.emit("clear store", {...data.data.data, roomId: `storage-${storageId}`});
        }
        catch (err) {
            console.log(err.message);
        }
    }


    return (
        <div>
            
            <button onClick={clearChat}>Clear Database</button>
            <h1>::::::::::Storage::::::::</h1>
            <h1>User: {auth.user}</h1>

            <input 
                name="searched"
                type="text"
                value={search} 
                // onKeyDown={searched}
                onChange={e => {setSearch(e.target.value)}}
                placeholder="Search"
            />

            <br />
            <br />


            {
                state.iresult && state.iresult.length!==0 && state.iresult.map((data, index) => {
                    //console.log(state.iresult);
                    return (
                        <div key={data.name}>
                            <button 
                                onClick = {() => {
                                    setName(data.name);
                                    setInp(data.data);
                                    setType("UPDATE");
                                }} 
                                key={data.name} 
                            >
                                {data.name}
                            </button>
                            <br />
                            <br />
                        </div>
                    );
                })
            }

            <br />
            <br />
            <br />
            <br />

            {/* The problem can be found in your onClick prop:

<button className="previous-round" onClick={setOrderData_(previous(orderData_))}>&#8249;</button>
                                            ^
Everything between the curly braces gets evaluated immediately. This causes the setOrderData_ function to be called in every render loop.

By wrapping the function with an arrow function, the evaluated code will result in a function that can be called whenever the user clicks on the button.

<button className="previous-round" onClick={() => setOrderData_(previous(orderData_))}
>&#8249;</button> */}

            {
                name && 
                <h1>{name}</h1>
            }

            { 
             name && type==="UPDATE" &&
                // <input 
                //     value={inp} 
                //     type="text" 
                //     onKeyDown={() => setChange(session)}
                //     onChange={e => {setPrevInp(inp); setInp(e.target.value)}}
                //     placeholder="Enterr Content" 
                // />
                <textarea 
                    rows="5"
                    placeholder="Enterrr Content"
                    onKeyDown={() => setChange(session)}
                    onChange={e => {setPrevInp(inp); setInp(e.target.value)}}
                    value={inp}
                />
            }

            <br />
            <br />
            <br />

            {
                !match && search!=" " &&
                //type==="NONE" && 
                <button onClick={createData}> Add </button>
            }


            <br />
            <br />
            <br />

            
            
        </div>
    )
}


export default Storage;




/*

// const Adda = async () => {} is wrong. We should not directly apply async to functional components
Exactly. Instead of implementing async/await directly on the functional component, I added useEffect hook inside the functional component like this useEffect(async () => {//code with await keyword here}, []) and all worked fine



useEffect(async () =>... returns a promise. Move the code to a separat function and just call it in useEffect( () => { checkAndRedirect() })

useEffect(() => {
 (async () => {

    //Put your logic here

  })();

  }, [])```
In the above syntax, `async` function is defined and immediately called

*/

// const generateName = () => {
    //     let length = 10;
    //     const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    //     let result = ' ';
    //     const charactersLength = characters.length;
    //     for(let i = 0; i < length; i++) {
    //         result += 
    //         characters.charAt(Math.floor(Math.random() * charactersLength));
    //     }
    //     setName(result);
    //     setInp("");
    //     setDatabase([...database, {name: name, data: inp, session: session}]);
    // }

    // const update = async (event) => {
    //     if (name && type==="UPDATE") {
    //         try {
    //             const config = {
    //                 headers: {
    //                     "Content-type": "application/json",
    //                     Authorization: `Bearer ${auth.token}`,
    //                 },
    //             };

    //             // setInp("");
    //             const data = await axios.put(
    //                 `/wtf/storage/${storageId}`,
    //                 {
    //                     data: inp,
    //                     name: name,
    //                 },
    //                 config
    //             );
    //             //console.log(data);
    //             console.log(data.data.data.data);
                
    //             const filteredData = database.map(obj=> obj.name===data.data.data.name ? {...obj, data: data.data.data.data} : obj);
    //             //console.log(filteredData);
    //             setDatabase(filteredData);
    //             setResult(filteredData);
    //             // setInp(database.filter(e => e.name == name).data);

    //         }
    //         catch (err) {
    //             console.log(err.message);
    //         }
    //     }
    // }


// const createData = async (event) => {
    //     if (search.trim()) {
    //         try {
    //             const config = {
    //                 headers: {
    //                     "Content-type": "application/json",
    //                     Authorization: `Bearer ${auth.token}`,
    //                 },
    //             };

    //             setInp("");
    //             const data = await axios.post(
    //                 `/wtf/storage/${storageId}`,
    //                 {
    //                     data: "",
    //                     name: search.trim(),
    //                 },
    //                 config
    //             );
                
    //             setDatabase([...database, data.data.data]);
    //             setName(data.data.data.name);
    //             setInp(data.data.data.data);
    //             setType("UPDATE");
    //             console.log(name, inp, type);
    //         }
    //         catch (err) {
    //             console.log(err.message);
    //         }
    //     }
    // }


// const searched = (e) => {
    //     if (search) {
    //         const res = database.filter(e => e.name.toLowerCase().trim().includes(search.toLowerCase().trim()));
    //         setResult(res);
    //         if (res.length == 0) {
    //             setInp("");
    //             setName("");
    //             setType("NONE");
    //         }
    //     }
    //     else {
    //         setResult(database);
    //     }
    // }


// {
//                 result && result.map((data, index) => {
//                     return (
//                         <>
//                             <button 
//                                 onClick = {() => {
//                                     setName(data.name);
//                                     setInp(data.data);
//                                     setType("UPDATE");
//                                 }} 
//                                 key={data.name} 
//                             >
//                                 {data.name}
//                             </button>
//                             <br />
//                             <br />
//                         </>
//                     );
//                 })
//             }


// { name &&  
//               type==="DISPLAY" &&
//              <input 
//                 name="inp" 
//                 id="inp" 
//                 value={inp} 
//                 // onKeyDown={sendMessage} 
//                 // onChange={e => {setInp(e.target.value)}} 
//                 placeholder="Enterr a message" 
//                 disabled
//              />
//             }


//  { type==="ADD" &&
//                 <input 
//                     value={name} 
//                     onChange={e => {setName(e.target.value); setType("ADD");}} 
//                     placeholder="Enterr a name" 
//                 />
//             } 


// {
//                 name && type==="ADD" &&
//                 <button 
//                     onClick={
//                         sendMessage
//                     }
//                 >
//                     Add
//                 </button>
//             }