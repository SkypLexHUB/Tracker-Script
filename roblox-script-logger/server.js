const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// บอร์ดแคสต์ข้อมูลไปยังหน้าเว็บทั้งหมดที่เปิดอยู่
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// API รับ Log จาก Roblox Script
app.post('/api/log', (req, res) => {
  const { type, functionName, codeSnippet, details, timestamp } = req.body;

  const logPayload = {
    id: Date.now() + Math.random().toString(36).substr(2, 4),
    type: type || 'EXEC', // EXEC, REMOTE, FUNCTION, PRINT
    functionName: functionName || 'Anonymous',
    codeSnippet: codeSnippet || '-- No code snippet provided',
    details: details || {},
    timestamp: timestamp || new Date().toLocaleTimeString()
  };

  broadcast(logPayload);
  res.status(200).json({ status: 'ok' });
});

// ส่งหน้าเว็บหลัก
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Script Logger Server running on port ${PORT}`);
});
      
