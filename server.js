const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const http = require('http');

// Create Express app
const app = express();
const server = http.createServer(app);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();
let clientId = 0;

// Handle WebSocket connections
wss.on('connection', (ws) => {
    // Assign unique ID to client
    const id = ++clientId;
    const clientInfo = {
        id: id,
        ws: ws,
        username: `Usuario${id}`
    };
    
    clients.set(ws, clientInfo);
    
    console.log(`Cliente ${id} conectado`);
    
    // Send welcome message to new client
    ws.send(JSON.stringify({
        type: 'system',
        message: `Bienvenido al chat! Eres ${clientInfo.username}`,
        timestamp: new Date().toISOString()
    }));
    
    // Notify other clients about new user
    broadcastMessage({
        type: 'system',
        message: `${clientInfo.username} se ha unido al chat`,
        timestamp: new Date().toISOString()
    }, ws);
    
    // Send current user count
    broadcastUserCount();
    
    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            const client = clients.get(ws);
            
            if (message.type === 'setUsername' && message.username) {
                const oldUsername = client.username;
                client.username = message.username;
                
                // Notify about username change
                broadcastMessage({
                    type: 'system',
                    message: `${oldUsername} cambió su nombre a ${client.username}`,
                    timestamp: new Date().toISOString()
                });
                
                broadcastUserCount();
            } else if (message.type === 'chat' && message.text) {
                // Broadcast chat message to all clients
                broadcastMessage({
                    type: 'chat',
                    username: client.username,
                    message: message.text,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
        const client = clients.get(ws);
        if (client) {
            console.log(`Cliente ${client.id} (${client.username}) desconectado`);
            
            // Notify other clients about user leaving
            broadcastMessage({
                type: 'system',
                message: `${client.username} ha salido del chat`,
                timestamp: new Date().toISOString()
            }, ws);
            
            clients.delete(ws);
            broadcastUserCount();
        }
    });
    
    // Handle connection errors
    ws.on('error', (error) => {
        console.error('Error en WebSocket:', error);
    });
});

// Broadcast message to all clients (except sender if specified)
function broadcastMessage(message, sender = null) {
    const messageStr = JSON.stringify(message);
    
    clients.forEach((client, ws) => {
        if (ws !== sender && ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
        }
    });
}

// Broadcast current user count
function broadcastUserCount() {
    const userList = Array.from(clients.values()).map(client => client.username);
    const message = {
        type: 'userCount',
        count: clients.size,
        users: userList,
        timestamp: new Date().toISOString()
    };
    
    broadcastMessage(message);
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor de chat ejecutándose en http://localhost:${PORT}`);
});