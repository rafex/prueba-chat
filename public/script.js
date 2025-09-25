class ChatClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        
        this.initializeElements();
        this.attachEventListeners();
        this.connect();
    }
    
    initializeElements() {
        // DOM elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.usernameInput = document.getElementById('usernameInput');
        this.setUsernameBtn = document.getElementById('setUsernameBtn');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.userCount = document.getElementById('userCount');
        this.usersList = document.getElementById('usersList');
    }
    
    attachEventListeners() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Set username on button click
        this.setUsernameBtn.addEventListener('click', () => this.setUsername());
        
        // Set username on Enter key
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.setUsername();
            }
        });
        
        // Handle window close/refresh
        window.addEventListener('beforeunload', () => {
            if (this.ws) {
                this.ws.close();
            }
        });
    }
    
    connect() {
        try {
            // Determine WebSocket URL
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                this.onConnect();
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            this.ws.onclose = (event) => {
                this.onDisconnect(event);
            };
            
            this.ws.onerror = (error) => {
                this.onError(error);
            };
            
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            this.onError(error);
        }
    }
    
    onConnect() {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Update UI
        this.connectionStatus.textContent = 'Conectado';
        this.connectionStatus.className = 'status connected';
        this.messageInput.disabled = false;
        this.sendBtn.disabled = false;
        
        this.addSystemMessage('Conectado al servidor de chat');
        
        console.log('Conectado al servidor WebSocket');
    }
    
    onDisconnect(event) {
        this.isConnected = false;
        
        // Update UI
        this.connectionStatus.textContent = 'Desconectado';
        this.connectionStatus.className = 'status disconnected';
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
        this.userCount.textContent = '0 usuarios';
        this.usersList.innerHTML = '';
        
        if (event.wasClean) {
            this.addSystemMessage('Desconectado del servidor');
        } else {
            this.addSystemMessage('Conexión perdida. Intentando reconectar...');
            this.attemptReconnect();
        }
        
        console.log('Desconectado del servidor WebSocket');
    }
    
    onError(error) {
        console.error('Error en WebSocket:', error);
        this.addSystemMessage('Error de conexión');
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            this.addSystemMessage(`Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                if (!this.isConnected) {
                    this.connect();
                }
            }, delay);
        } else {
            this.addSystemMessage('No se pudo reconectar. Recarga la página para intentar nuevamente.');
        }
    }
    
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'chat':
                    this.addChatMessage(message.username, message.message, message.timestamp);
                    break;
                case 'system':
                    this.addSystemMessage(message.message, message.timestamp);
                    break;
                case 'userCount':
                    this.updateUserCount(message.count, message.users);
                    break;
                default:
                    console.log('Mensaje desconocido:', message);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }
    
    sendMessage() {
        const text = this.messageInput.value.trim();
        
        if (text && this.isConnected) {
            const message = {
                type: 'chat',
                text: text
            };
            
            this.ws.send(JSON.stringify(message));
            this.messageInput.value = '';
            this.messageInput.focus();
        }
    }
    
    setUsername() {
        const username = this.usernameInput.value.trim();
        
        if (username && this.isConnected) {
            const message = {
                type: 'setUsername',
                username: username
            };
            
            this.ws.send(JSON.stringify(message));
            this.usernameInput.value = '';
        }
    }
    
    addChatMessage(username, text, timestamp) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message chat';
        
        const timeStr = this.formatTimestamp(timestamp);
        
        messageElement.innerHTML = `
            <span class="timestamp">[${timeStr}]</span>
            <span class="username">${this.escapeHtml(username)}:</span>
            <span class="content">${this.escapeHtml(text)}</span>
        `;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    addSystemMessage(text, timestamp = null) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        
        const timeStr = timestamp ? this.formatTimestamp(timestamp) : this.formatTimestamp(new Date().toISOString());
        
        messageElement.innerHTML = `
            <span class="timestamp">[${timeStr}]</span>
            <span class="content">${this.escapeHtml(text)}</span>
        `;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    updateUserCount(count, users) {
        this.userCount.textContent = `${count} usuario${count !== 1 ? 's' : ''}`;
        
        // Update users list
        this.usersList.innerHTML = '';
        if (users && users.length > 0) {
            users.forEach(username => {
                const userElement = document.createElement('li');
                userElement.textContent = username;
                this.usersList.appendChild(userElement);
            });
        }
    }
    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize chat client when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatClient();
});