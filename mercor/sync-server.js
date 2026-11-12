/**
 * Local Mercor Sync HTTP Service
 * Provides a local REST endpoint for the Mercor Dashboard so users can trigger
 * real-time API syncs directly with one click from the browser.
 */

const http = require('http');
const { syncMercorRoles } = require('./sync-mercor-roles');

const PORT = 4884;

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/sync' || req.url === '/api/sync') {
    try {
      console.log('[Sync Server] Triggering Mercor sync from dashboard request...');
      const payload = await syncMercorRoles();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: payload }));
    } catch (err) {
      console.error('[Sync Server Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (req.url === '/status' || req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'running', port: PORT }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Mercor Sync Server] Running on http://127.0.0.1:${PORT}`);
});
