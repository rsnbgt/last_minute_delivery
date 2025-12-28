import axios from 'axios';

// 10.0.2.2 is for Android Emulator
// 192.168.1.3 is your Local LAN IP (Use this for Physical Device)
const API_URL = 'http://192.168.1.3:3000/api/delivery';

export const confirmDelivery = async (shipmentId, otpCode, agentId) => {
    try {
        const response = await axios.post(`${API_URL}/confirm`, {
            shipment_id: shipmentId,
            otp_code: otpCode,
            agent_id: agentId
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getAgentHistory = async (agentId) => {
    try {
        const response = await axios.get(`${API_URL}/history/${agentId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};
// ... confirmDelivery and getAgentHistory ...

export const registerAgent = async (agentData) => {
    try {
        const response = await axios.post('http://192.168.1.3:3000/api/auth/register', agentData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const loginAgent = async (credentials) => {
    try {
        const response = await axios.post('http://192.168.1.3:3000/api/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const requestOTP = async (shipmentId) => {
    try {
        const response = await axios.post(`${API_URL}/request-otp`, { shipment_id: shipmentId });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};
