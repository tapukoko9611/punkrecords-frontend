import axios from 'axios';

const API_BASE_URL = '/api/users';

const authApi = {
    login: async (userName, password) => {
        try {
            // console.log("api - asking for login")
            const response = await axios.get(`${API_BASE_URL}/login?userName=${userName}&password=${password}`);
            // console.log("api - logged in: ", response.data)
            return response.data;
        } catch (error) {
            return error.response ? error.response.data : { isError: true, message: error.message };
        }
    },

    signup: async (userName, password, code, token) => {
        try {
            // console.log("api - asking for signup")
            const response = await axios.post(`${API_BASE_URL}/signup`, { userName, password, code }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log("api - signed up: ", response.data)
            return response.data;
        } catch (error) {
            return error.response ? error.response.data : { isError: true, message: error.message };
        }
    },

    updateUser: async (userName, password, code, token) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/update`, { userName, password, code }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return error.response ? error.response.data : { isError: true, message: error.message };
        }
    },

    getUser: async (token) => {
        try {
            // console.log("api - asking get userDetails")
            const response = await axios.get(`${API_BASE_URL}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // console.log("api - got userDetails: ", response.data)
            return response.data;
        } catch (error) {
            return error.response ? error.response.data : { isError: true, message: error.message };
        }
    },

    checkUserName: async (token, userName) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/exists/${userName}`, {}, { // It's a PUT request with userName in the path
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data.exists; // Backend returns { token: ..., exists: boolean }
        } catch (error) {
            console.error("Error checking username:", error);
            return true; // Default to taken on error to prevent signup with potential issues
        }
    }
};

export default authApi;