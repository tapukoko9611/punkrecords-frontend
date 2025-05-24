import axios from 'axios';

const API_BASE_URL = (process.env.API_BASE_URL|| "") + '/api/editors';

const editorApi = {
    checkEditorName: async (token, editorName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/exists/${editorName}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data.exists;
        } catch (error) {
            console.error("Error checking editor name:", error);
            return true;
        }
    },

    updateEditor: async (editorName, isPrivate, password, token) => {
            try {
                const response = await axios.put(`${API_BASE_URL}/update`, { editorName, password, isPrivate }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                return error.response ? error.response.data : { isError: true, message: error.message };
            }
        },
};

export default editorApi;