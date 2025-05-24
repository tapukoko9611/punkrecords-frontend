import axios from 'axios';

const API_BASE_URL = (process.env.API_BASE_URL|| "") + '/api/rooms';

const roomApi = {
    checkRoomName: async (token, roomName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/exists/${roomName}`, {}, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data.exists;
        } catch (error) {
            console.error("Error checking room name:", error);
            return true;
        }
    },

    updateRoom: async (roomName, isPrivate, password, token) => {
            try {
                const response = await axios.put(`${API_BASE_URL}/update`, { roomName, password, isPrivate }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                return error.response ? error.response.data : { isError: true, message: error.message };
            }
        },
};

export default roomApi;