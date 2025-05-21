// src/contexts/editor/EditorContext.js
import React, { createContext, useReducer, useContext, useCallback } from 'react';

const initialStateEditor = {
    editors: {},
    currentEditorId: null,
    isLoading: false,
    error: null,
};

const editorReducer = (state, action) => {
    switch (action.type) {
        case 'SET_EDITORS':
            return { ...state, editors: action.payload, isLoading: false, error: null };
        case 'SET_CURRENT_EDITOR':
            return { ...state, currentEditorId: action.payload, isLoading: false, error: null };
        case 'ADD_EDITOR':
            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload.editor._id]: {
                        ...action.payload.editor,
                        newEdits: 0,
                    },
                },
                isLoading: false,
                error: null,
            };
        case 'INCREMENT_NEW_EDITS':
            if (!state.editors[action.payload]) return state;
            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload]: {
                        ...state.editors[action.payload],
                        newEdits: (state.editors[action.payload]?.newEdits || 0) + 1,
                    },
                },
            };
        case 'RESET_NEW_EDITS':
            if (!state.editors[action.payload]) return state;
            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload]: {
                        ...state.editors[action.payload],
                        newEdits: 0,
                    },
                },
            };
        case 'EDITOR_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'EDITOR_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
};

const EditorContext = createContext({
    state: initialStateEditor,
    dispatch: () => { },
});

const EditorProvider = ({ children }) => {
    const [state, dispatch] = useReducer(editorReducer, initialStateEditor);

    const setCurrentEditor = useCallback((editorId) => {
        dispatch({ type: 'SET_CURRENT_EDITOR', payload: editorId });
    }, []);

    const incrementNewEdits = useCallback((editorId) => {
        dispatch({ type: 'INCREMENT_NEW_EDITS', payload: editorId });
    }, []);

    const resetNewEdits = useCallback((editorId) => {
        dispatch({ type: 'RESET_NEW_EDITS', payload: editorId });
    }, []);

    const setEditors = useCallback((editors) => {
        dispatch({ type: 'SET_EDITORS', payload: editors });
    }, []);

    const addEditor = useCallback((editor) => {
        dispatch({ type: 'ADD_EDITOR', payload: { editor } });
    }, []);

    return (
        <EditorContext.Provider value={{ state, dispatch, setCurrentEditor, incrementNewEdits, resetNewEdits, setEditors, addEditor }}>
            {children}
        </EditorContext.Provider>
    );
};

export { EditorContext, EditorProvider };