import axios from "axios";

// Set config defaults when creating the instance
const axiosInstance = axios.create({
  baseURL: 'https://dashapi.onout.org'
});

export default axiosInstance;