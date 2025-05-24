import axios from 'axios';

const API_BASE_URL = (process.env.API_BASE_URL|| "https://punkrecords-backend.onrender.com") + '/api/files';

const fileApi = {
    checkFileName: async (token, fileName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/exists/${fileName}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data.exists;
        } catch (error) {
            console.error("Error checking file name:", error);
            return true;
        }
    },

    updateFile: async (fileName, isPrivate, password, token) => {
            try {
                const response = await axios.put(`${API_BASE_URL}/update`, { fileName, password, isPrivate }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                return error.response ? error.response.data : { isError: true, message: error.message };
            }
        },
};

export default fileApi;