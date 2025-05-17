import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',  // 백엔드 API 서버 주소
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 