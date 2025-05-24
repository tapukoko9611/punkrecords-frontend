import React, { createContext, useReducer, useCallback } from 'react';

const initialStateFile = {
    files: {},         // { fileId: { file: <fileData>, seenMessages: [], unseenMessages: [] } }
    fileOrder: {},     // map fileId -> {fileName, notifications, order}
    currentFileId: null,
    tempFile: null,
    isTempFileActive: false,
    isLoading: false,
    error: null,
};

const fileReducer = (state, action) => {
    switch (action.type) {

        case 'SET_FILES': {
            const receivedFiles = action.payload;
            const normalizedFiles = {};
            for (const fileId in receivedFiles) {
                if (receivedFiles.hasOwnProperty(fileId)) {
                    const fileDetails = receivedFiles[fileId];
                    normalizedFiles[fileId] = {
                        file: fileDetails,
                    };
                }
            }
            
            const fileOrder = {};
            for (const fileId in normalizedFiles) {
                if (normalizedFiles.hasOwnProperty(fileId)) {
                    const fileName = normalizedFiles[fileId].file.name;
                    fileOrder[fileId] = {
                        name: fileName,
                        notifications: 0,
                        order: Date.now()
                    };
                }
            }
            return { ...state, files: normalizedFiles, fileOrder, isLoading: false, error: null };
        }

        case 'SET_CURRENT_FILE':
            return { ...state, currentFileId: action.payload, isLoading: false, fileOrder: { ...state.fileOrder, [action.payload]: { ...state.fileOrder[action.payload], notifications: 0 } }, error: null };

        case 'ADD_FILE': {
            
            const fileData = action.payload.file;

            if (!fileData || !fileData._id) {
                console.error("ADD_FILE: Invalid file data in payload", action.payload.file);
                return state;
            }

            const updatedOrder = { ...state.fileOrder };
            const fileId = fileData._id;

            if (updatedOrder[fileId]) {
                updatedOrder[fileId] = {
                    ...updatedOrder[fileId],
                    notifications: updatedOrder[fileId].notifications,
                    order: Date.now()
                };
            } else {
                
                const fileName = (state.files[fileId].file && state.files[fileId].file.name) || 'File';
                updatedOrder[fileId] = {
                    name: fileName,
                    notifications: 0,
                    order: Date.now()
                };
            }



            return {
                ...state,
                files: {
                    ...state.files,
                    [fileData._id]: {
                        file: fileData,
                    }
                },
                fileOrder: updatedOrder,
                error: null,
            };
        }

        case 'SET_TEMP_FILE': {
            
            const fileData = action.payload.file;

            if (!fileData || !fileData._id) {
                console.error("ADD_FILE: Invalid file data in payload", action.payload.file);
                return state;
            }

            return {
                ...state,
                tempFile: fileData,
                isTempFileActive: true,
                error: null,
            };
        }

        case 'CLEAR_TEMP_FILE': {

            return {
                ...state,
                tempFile: null,
                isTempFileActive: false,
                error: null,
            };
        }

        case 'SWAP_TEMP_FILE': {
            
            const fileData = state.tempFile;

            if (!fileData || !fileData._id) {
                console.error("ADD_FILE: Invalid file data in payload", state.tempFile);
                return state;
            }

            const fileId = fileData._id;
            const updatedOrder = { ...state.fileOrder };

            if (updatedOrder[fileId]) {
                updatedOrder[fileId] = {
                    ...updatedOrder[fileId],
                    notifications: 0,
                    order: Date.now() 
                };
            } else {
                
                const fileName = fileData.name;
                updatedOrder[fileId] = {
                    name: fileName,
                    notifications: 0,
                    order: Date.now()
                };
            }



            return {
                ...state,
                tempFile: null,
                isTempFileActive: false,
                currentFileId: fileData._id,
                files: {
                    ...state.files,
                    [fileData._id]: {
                        file: fileData,
                    }
                },
                fileOrder: updatedOrder,
                error: null,
            };
        }

        case 'SET_UPDATED_FILE': {
            
            const fileData = action.payload.file;

            if (!fileData || !fileData._id) {
                console.error("SET_UPDATED_FILE: Invalid file data in payload", state.tempFile);
                return state;
            }

            const fileId = fileData._id;
            const updatedOrder = { ...state.fileOrder };

            if (updatedOrder[fileId]) {
                updatedOrder[fileId] = {
                    ...updatedOrder[fileId],
                    notifications: state.currentFileId === fileId ? 0 : updatedOrder[fileId].notifications + 1,
                    order: Date.now()
                };
            } else {
                const fileName = (state.files[fileId].file && state.files[fileId].file.name) || 'File';
                updatedOrder[fileId] = {
                    name: fileName,
                    notifications: state.currentFileId === fileId ? 0 : 1,
                    order: Date.now()
                };
            }

            return {
                ...state,
                files: {
                    ...state.files,
                    [fileData._id]: {
                        file: fileData,
                    }
                },
                fileOrder: updatedOrder,
                error: null,
            };
        }

        case 'MARK_CONTENT_AS_SEEN': {
            
            const fileIdToMark = action.payload;
            if (!state.files[fileIdToMark]) return state;
            return { ...state, fileOrder: { ...state.fileOrder, [fileIdToMark]: { ...state.fileOrder[fileIdToMark], notifications: 0 } } };
        }

        case 'FILE_ERROR':
            return { ...state, isLoading: false, error: action.payload };

        case 'FILE_LOADING':
            return { ...state, isLoading: true, error: null };

        default:
            return state;
    }
};

const FileContext = createContext({
    state: initialStateFile,
    dispatch: () => { },
    setCurrentFile: () => { },
    markContentAsSeen: () => { },
    setFiles: () => { },
    addFile: () => { },
});

const FileProvider = ({ children }) => {
    const [state, dispatch] = useReducer(fileReducer, initialStateFile);

    const setCurrentFile = useCallback((fileId) => {
        dispatch({ type: 'SET_CURRENT_FILE', payload: fileId });
    }, [dispatch]);

    const markContentAsSeen = useCallback((fileId) => {
        dispatch({ type: 'MARK_CONTENT_AS_SEEN', payload: fileId });
    }, [dispatch]);

    const setFiles = useCallback((files) => {
        dispatch({ type: 'SET_FILES', payload: files });
    }, [dispatch]);

    const addFile = useCallback((file) => {
        dispatch({ type: 'ADD_FILE', payload: { file } });
    }, [dispatch]);

    return (
        <FileContext.Provider value={{ state, dispatch, setCurrentFile, markContentAsSeen, setFiles, addFile }}>
            {children}
        </FileContext.Provider>
    );
};

export { FileContext, FileProvider };