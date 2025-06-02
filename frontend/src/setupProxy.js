const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 환경변수에서 API URL 가져오기 (기본값: http://localhost:8000)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // URL 파싱하여 WebSocket URL 생성
  const apiUrl = new URL(API_URL);
  const WS_URL = `ws://${apiUrl.host}`;
  
  // API 서버 프록시
  app.use(
    '/api',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api/v1'
      }
    })
  );

  // WebSocket 프록시
  app.use(
    '/ws',
    createProxyMiddleware({
      target: WS_URL,
      ws: true,
      changeOrigin: true
    })
  );
};