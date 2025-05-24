import axios from 'axios';

const API_BASE_URL = (process.env.API_BASE_URL|| "") + '/api/calls';

const callApi = {
    checkCallName: async (token, callName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/exists/${callName}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data.exists;
        } catch (error) {
            console.error("Error checking call name:", error);
            return true;
        }
    },

    updateCall: async (callName, isPrivate, password, token) => {
            try {
                const response = await axios.put(`${API_BASE_URL}/update`, { callName, password, isPrivate }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                return error.response ? error.response.data : { isError: true, message: error.message };
            }
        },
};

export default callApi;