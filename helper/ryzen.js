import '../global.js'
import axios from 'axios';
const axiosInstance = axios.create({
    baseURL: globalThis.apiHelper.ryzen.baseUrl,
    headers: {
        'Accept': 'application/json',
    }
});

export const ryzen = async (url, config = {}) => {
    try {
        return await axiosInstance.get(url, config);
    } catch (error) {
        console.error('Error in ryzendesu request:', error);
        throw error;
    }
};

