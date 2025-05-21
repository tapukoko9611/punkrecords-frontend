// src/contexts/file/FileContext.js
import React, { createContext, useReducer, useContext, useCallback } from 'react';


const initialStateFile = {
    files: {},
    currentFileId: null,
    isLoading: false,
    error: null,
};


const fileReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FILES':
            return { ...state, files: action.payload, isLoading: false, error: null };
        case 'SET_CURRENT_FILE':
            return { ...state, currentFileId: action.payload, isLoading: false, error: null };
        case 'ADD_FILE':
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.payload.file._id]: action.payload.file,
                },
                isLoading: false,
                error: null,
            };
        case 'UPDATE_FILE':
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.payload.fileId]: {
                        ...state.files[action.payload.fileId],
                        ...action.payload.updates,
                    },
                },
                isLoading: false,
                error: null,
            };
        case 'REMOVE_FILE':
            const { [action.payload]: removedFile, ...restFiles } = state.files;
            return { ...state, files: restFiles, isLoading: false, error: null };
        case 'FILE_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'FILE_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
};

const FileContext = createContext({
    state: initialStateFile,
    dispatch: () => { },
});

const FileProvider = ({ children }) => {
    const [state, dispatch] = useReducer(fileReducer, initialStateFile);

    const setCurrentFile = useCallback((fileId) => {
        dispatch({ type: 'SET_CURRENT_FILE', payload: fileId });
    }, []);

    const setFiles = useCallback((files) => {
        dispatch({ type: 'SET_FILES', payload: files });
    }, []);

    const addFile = useCallback((file) => {
        dispatch({ type: 'ADD_FILE', payload: { file } });
    }, []);

    const updateFile = useCallback((fileId, updates) => {
        dispatch({ type: 'UPDATE_FILE', payload: { fileId, updates } });
    }, []);

    const removeFile = useCallback((fileId) => {
        dispatch({ type: 'REMOVE_FILE', payload: fileId });
    }, []);

    return (
        <FileContext.Provider value={{ state, dispatch, setCurrentFile, setFiles, addFile, updateFile, removeFile }}>
            {children}
        </FileContext.Provider>
    );
};

export { FileContext, FileProvider };