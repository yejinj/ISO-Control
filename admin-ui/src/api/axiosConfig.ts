import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // localhost로 변경
  timeout: 5000,
});

export default apiClient;