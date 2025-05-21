import axios from 'axios';

const API_BASE_URL = '/api/rooms'; // Adjust if your API base URL is different

const roomApi = {
    checkRoomName: async (token, roomName) => {
        try {
            // console.log(roomName);
            const response = await axios.get(`${API_BASE_URL}/exists/${roomName}`, {}, { // It's a PUT request with userName in the path
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data.exists; // Backend returns { token: ..., exists: boolean }
        } catch (error) {
            console.error("Error checking room name:", error);
            return true; // Default to taken on error to prevent signup with potential issues
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