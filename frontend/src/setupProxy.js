const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API 서버 프록시
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
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
      target: 'ws://localhost:8000',
      ws: true,
      changeOrigin: true
    })
  );
};