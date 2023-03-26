import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from 'axios';
import "styled-components";

import AuthContext from "../context/auth-context";
import styled from "styled-components";



// If something occurs, its becausee of async sto main function
// Just use useeEffectt hook isnide and inside it use async on function, not directly
const Adda = ({ socket }) => {
    const { auth, setAuth } = useContext(AuthContext);
    let { addaId } = useParams();

    const [ inp, setInp ] = useState("");
    const divRef = useRef(null);

    const chats = [];
    const reducer = ( state, action ) => {
        console.log(state, action.type);
        switch (action.type) {
            case "message recieved":
                return [
                    ...state,
                    action.payload,
                ];
            case "message sent":
                return [
                    ...state,
                    action.payload,
                ];
            case "load chat":
                return action.payload;
            case "clear chat":
                return action.payload;
            default:
                return state;
        }
    };
    const [ chat, dispatch ] = useReducer(reducer, chats);

    // GET ALL MESSAGES
    useEffect(() => {
        (async () => {

            const config = {
                headers: {
                    Authorization: auth.token? `Bearer ${auth.token}`: '',
                },
            };

            await axios
                .get(`/wtf/adda/${addaId}`, config)
                .then((data) => {
                    if (data.data.token) {
                        setAuth({
                            token: data.data.token,
                            user: data.data.session,
                        });
                    }

                    dispatch({
                        type: "load chat",
                        payload: data.data.chat,
                    });
                    socket.emit("join room", `adda-${addaId}`);
                })
                .catch((err) => {
                    console.log(err.message);
                });
        })().catch((err) => {
                console.log(err.message);
            });
            
        
        //defines a function and calls it then and there itself. // See through that it donesn't return any shit 
            
    }, [addaId]); // [emppty array] -> executes once

    //     const config = {
    //         headers: {
    //             Authorization: auth.token? `Bearer ${auth.token}`: '',
    //         },
    //     };

    //     await axios
    //         .get(`/wtf/adda/${addaId}`, config)
    //         .then((data) => {
    //             //console.log(data);
    //             if (data.data.token) {
    //                 setAuth({
    //                     token: data.data.token,
    //                     user: data.data.session,
    //                 });
    //             }
    //             setChat(data.data.chat);
    //         })
    //         .then(() => {
    //             //console.log(auth);
    //         })
    //         .catch((err) => {
    //             console.log(err.message);
    //         });
    // }

    // useEffect(() => {
    //     fetchMessages().catch((err) => {
    //         console.log(err.message);
    //     });

    // }, [addaId]);

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

    // RECIEVE MESSAGES message response
    useEffect(() => {
        socket.on("new message", (msg) => {
            dispatch({
                type: "message recieved",
                payload: msg,
            });
        });
    }, []);
    
    // CLEAR CHAT
    useEffect(() => {
        socket.on("clear chat", (msg) => {
            dispatch({
                type: "clear chat",
                payload: [],
            });
        });
    }, []);

    // SCROLL OT THE BOTTOM
    useEffect( () => {
        divRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    // SEND MESSAGES
    const sendMessage = async (event) => {
        if (event.key==='Enter' && inp) {
            console.log("Sending...");
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                };

                const data = await axios.post(
                    `/wtf/adda/${addaId}`,
                    {
                        text: inp
                    },
                    config
                );
                setInp("");
                
                socket.emit("new message", {...data.data.chat, roomId: `adda-${addaId}`});

                dispatch({
                    type: "message sent",
                    payload: data.data.chat,
                });

            }
            catch (err) {
                console.log(err.message);
            }
        }
    }

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
                `/wtf/adda/${addaId}`,
                config
            );

            socket.emit("clear chat", {...data.data.chat, roomId: `adda-${addaId}`});
            
            dispatch({
                type: "clear chat",
                payload: [],
            })

        }
        catch (err) {
            console.log(err.message);
        }
    }

    return (
            <Html>

                <Header>
                    <ChatName>
                        {auth.user}
                    </ChatName>
                    <ChatName>
                        <h2>{addaId}</h2>
                    </ChatName>
                    <ClearButton>
                        <button onClick={clearChat}>
                            Clear
                        </button>
                    </ClearButton>
                </Header>

                <Main>
                    {
                        chat && chat.map((anObjectMapped, index) => {
                            return (
                                <MessageBox key={`${anObjectMapped.session}_${anObjectMapped.text}_${index}`}>
                                    <MessageTop>
                                        <UserName>
                                            {anObjectMapped.session}
                                        </UserName>
                                        <Time>
                                            time
                                        </Time>
                                    </MessageTop>
                                    <MessageContent>
                                        <p >
                                            {anObjectMapped.text}
                                        </p>
                                    </MessageContent>
                                </MessageBox>
                            );
                        })
                    }
                    <div ref={divRef} />
                </Main>

                <Footer>
                    <InputField>
                        <input 
                            name="inp" 
                            id="inp" 
                            value={inp} 
                            onChange={e => {setInp(e.target.value)}} 
                            onKeyDown={sendMessage} 
                            placeholder="Enterr a message" 
                        />
                    </InputField>
                </Footer>

            </Html>
    )
}


export default Adda;

const Html = styled.div`
    /* left: 0;
    padding: 0;
    margin: 0;
    background-color: #787180;
    width: 100%;
    height: 100%; */
    background-color: #787180;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    
    

    overflow-y: scroll;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none; 
    ::-webkit-scrollbar {
        display: none;
    }

`;

const Header = styled.header`
    left:0;
    top:0;
    padding:20px;
    position: fixed;
    display: flex;
    height: 25px;
    width:100%;
    background-color: #181819;
    color: white;
    justify-content: space-between;
    align-items: center;
`;

const ChatName = styled.div`
    padding-left:20px;
`;

const ClearButton = styled.div`
    padding-right:30px;
    & > button {
        height:25px;
        width:45px;
        border-radius: 4px;
        border:none;
        cursor:pointer;
    }
`;

const Main = styled.main`
    left: 0;
    margin-top:60px;
    width:100%;
    height:100%;
    padding-bottom: 80px;
    background-color: #787180;
    scroll-behavior: smooth;
    /* display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: #787180;
    padding-bottom: 80px;
    scroll-behavior: smooth;
    margin-top: 60px; */
    overflow-y: hidden;
    overflow-x: hidden;
    
`;

const MessageBox = styled.div`
    height:auto;
    width:100%;
    background-color: transparent;
    padding:5px;
    border: 1px solid #8f9299;
`;

const MessageTop = styled.div`
    padding:6px;
    background: transparent;
    display: flex;
    flex-direction: row;
`;

const UserName = styled.div`
    padding: 0px 10px 0px 10px;
    background-color: lightgreen;
    border-radius: 20px;
    color: goldenrod;
    font-size:17px;
    font-weight: 700;
`;

const Time = styled.div`
    padding-left:25px;
    color: white;
    //font-size:10.3px;
    //font-weight: 300;
`;

const MessageContent = styled.div`
    display: flex;
    padding: 0px 10px 0px 10px;
    font-size: 1.08rem;
    text-align: justify;
    color: white;
`;

const Footer = styled.footer`
    bottom:0;
    padding:25px 0px 25px 25px;
    position: fixed;
    display: flex;
    height:20px;
    width:100%;
    background: #7f7f7f;
    justify-content: space-between;
    align-items: center;
    & > button {
        padding:3px;
        cursor:pointer;
    }
`;

const InputField = styled.div`
    width:100%;
    margin-right: 30px;
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px;
    overflow-y: hidden;

    input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 16px;
        padding: 6px;
        resize: vertical;
        overflow: hidden; 
        height: 33px;
    }
`;










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