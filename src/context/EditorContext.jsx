import React, { createContext, useReducer, useCallback } from 'react';

const initialStateEditor = {
    editors: {},         // { editorId: { editor: <editorData>, seenMessages: [], unseenMessages: [] } }
    editorOrder: {},     // map editorId -> {editorName, notifications, order}
    currentEditorId: null,
    tempEditor: null,
    isTempEditorActive: false,
    isLoading: false,
    error: null,
};

const editorReducer = (state, action) => {
    switch (action.type) {

        case 'SET_EDITORS': {
            const receivedEditors = action.payload;
            const normalizedEditors = {};
            for (const editorId in receivedEditors) {
                if (receivedEditors.hasOwnProperty(editorId)) {
                    const editorDetails = receivedEditors[editorId];
                    normalizedEditors[editorId] = {
                        editor: editorDetails,
                    };
                }
            }
            
            const editorOrder = {};
            for (const editorId in normalizedEditors) {
                if (normalizedEditors.hasOwnProperty(editorId)) {
                    const editorName = normalizedEditors[editorId].editor.name;
                    editorOrder[editorId] = {
                        name: editorName,
                        notifications: 0,
                        order: Date.now()
                    };
                }
            }
            return { ...state, editors: normalizedEditors, editorOrder, isLoading: false, error: null };
        }

        case 'SET_CURRENT_EDITOR':
            return { ...state, currentEditorId: action.payload, isLoading: false, editorOrder: { ...state.editorOrder, [action.payload]: { ...state.editorOrder[action.payload], notifications: 0 } }, error: null };

        case 'ADD_EDITOR': {
            
            const editorData = action.payload.editor;

            if (!editorData || !editorData._id) {
                console.error("ADD_EDITOR: Invalid editor data in payload", action.payload.editor);
                return state;
            }

            const updatedOrder = { ...state.editorOrder };
            const editorId = editorData._id;

            if (updatedOrder[editorId]) {
                updatedOrder[editorId] = {
                    ...updatedOrder[editorId],
                    notifications: updatedOrder[editorId].notifications,
                    order: Date.now()
                };
            } else {
                
                const editorName = (state.editors[editorId].editor && state.editors[editorId].editor.name) || 'Editor';
                updatedOrder[editorId] = {
                    name: editorName,
                    notifications: 0,
                    order: Date.now()
                };
            }



            return {
                ...state,
                editors: {
                    ...state.editors,
                    [editorData._id]: {
                        editor: editorData,
                    }
                },
                editorOrder: updatedOrder,
                error: null,
            };
        }

        case 'SET_TEMP_EDITOR': {
            
            const editorData = action.payload.editor;

            if (!editorData || !editorData._id) {
                console.error("ADD_EDITOR: Invalid editor data in payload", action.payload.editor);
                return state;
            }

            return {
                ...state,
                tempEditor: editorData,
                isTempEditorActive: true,
                error: null,
            };
        }

        case 'CLEAR_TEMP_EDITOR': {

            return {
                ...state,
                tempEditor: null,
                isTempEditorActive: false,
                error: null,
            };
        }

        case 'SWAP_TEMP_EDITOR': {
            
            const editorData = state.tempEditor;

            if (!editorData || !editorData._id) {
                console.error("ADD_EDITOR: Invalid editor data in payload", state.tempEditor);
                return state;
            }

            const editorId = editorData._id;
            const updatedOrder = { ...state.editorOrder };

            if (updatedOrder[editorId]) {
                updatedOrder[editorId] = {
                    ...updatedOrder[editorId],
                    notifications: 0,
                    order: Date.now() 
                };
            } else {
                
                const editorName = editorData.name;
                updatedOrder[editorId] = {
                    name: editorName,
                    notifications: 0,
                    order: Date.now()
                };
            }



            return {
                ...state,
                tempEditor: null,
                isTempEditorActive: false,
                currentEditorId: editorData._id,
                editors: {
                    ...state.editors,
                    [editorData._id]: {
                        editor: editorData,
                    }
                },
                editorOrder: updatedOrder,
                error: null,
            };
        }

        case 'SET_UPDATED_EDITOR': {
            
            const editorData = action.payload.editor;

            if (!editorData || !editorData._id) {
                console.error("SET_UPDATED_EDITOR: Invalid editor data in payload", state.tempEditor);
                return state;
            }

            const editorId = editorData._id;
            const updatedOrder = { ...state.editorOrder };

            if (updatedOrder[editorId]) {
                updatedOrder[editorId] = {
                    ...updatedOrder[editorId],
                    notifications: state.currentEditorId === editorId ? 0 : updatedOrder[editorId].notifications + 1,
                    order: Date.now()
                };
            } else {
                const editorName = (state.editors[editorId].editor && state.editors[editorId].editor.name) || 'Editor';
                updatedOrder[editorId] = {
                    name: editorName,
                    notifications: state.currentEditorId === editorId ? 0 : 1,
                    order: Date.now()
                };
            }

            return {
                ...state,
                editors: {
                    ...state.editors,
                    [editorData._id]: {
                        editor: editorData,
                    }
                },
                editorOrder: updatedOrder,
                error: null,
            };
        }

        case 'MARK_CONTENT_AS_SEEN': {
            
            const editorIdToMark = action.payload;
            if (!state.editors[editorIdToMark]) return state;
            return { ...state, editorOrder: { ...state.editorOrder, [editorIdToMark]: { ...state.editorOrder[editorIdToMark], notifications: 0 } } };
        }

        case 'EDITOR_ERROR':
            return { ...state, isLoading: false, error: action.payload };

        case 'EDITOR_LOADING':
            return { ...state, isLoading: true, error: null };

        default:
            return state;
    }
};

const EditorContext = createContext({
    state: initialStateEditor,
    dispatch: () => { },
    setCurrentEditor: () => { },
    markContentAsSeen: () => { },
    setEditors: () => { },
    addEditor: () => { },
});

const EditorProvider = ({ children }) => {
    const [state, dispatch] = useReducer(editorReducer, initialStateEditor);

    const setCurrentEditor = useCallback((editorId) => {
        dispatch({ type: 'SET_CURRENT_EDITOR', payload: editorId });
    }, [dispatch]);

    const markContentAsSeen = useCallback((editorId) => {
        dispatch({ type: 'MARK_CONTENT_AS_SEEN', payload: editorId });
    }, [dispatch]);

    const setEditors = useCallback((editors) => {
        dispatch({ type: 'SET_EDITORS', payload: editors });
    }, [dispatch]);

    const addEditor = useCallback((editor) => {
        dispatch({ type: 'ADD_EDITOR', payload: { editor } });
    }, [dispatch]);

    return (
        <EditorContext.Provider value={{ state, dispatch, setCurrentEditor, markContentAsSeen, setEditors, addEditor }}>
            {children}
        </EditorContext.Provider>
    );
};

export { EditorContext, EditorProvider };