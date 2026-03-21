import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7166/api',
});

export default api;