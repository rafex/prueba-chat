# Chat WebSocket

Una aplicación de chat en tiempo real desarrollada con JavaScript, Node.js y WebSockets.

## Características

- 💬 Chat en tiempo real usando WebSockets
- 👥 Múltiples usuarios simultáneos
- 🔄 Reconexión automática
- 📱 Diseño responsivo
- 🎨 Interfaz moderna y atractiva
- 👤 Cambio de nombre de usuario
- 📊 Contador de usuarios conectados

## Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **WebSockets**: ws (biblioteca de WebSocket para Node.js)

## Instalación y uso

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd prueba-chat
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor:
```bash
npm start
```

4. Abre tu navegador y ve a `http://localhost:3000`

## Funcionalidades

### Cliente
- Conexión automática al servidor WebSocket
- Envío de mensajes en tiempo real
- Cambio de nombre de usuario
- Visualización de usuarios conectados
- Reconexión automática en caso de pérdida de conexión
- Interfaz responsiva para dispositivos móviles

### Servidor
- Manejo de múltiples conexiones WebSocket
- Broadcast de mensajes a todos los clientes conectados
- Gestión de usuarios (conexión/desconexión)
- Notificaciones de sistema
- Conteo de usuarios en tiempo real

## Estructura del proyecto

```
prueba-chat/
├── server.js          # Servidor WebSocket y Express
├── package.json       # Dependencias y scripts
├── README.md          # Documentación
└── public/           # Archivos del frontend
    ├── index.html    # Página principal
    ├── style.css     # Estilos CSS
    └── script.js     # Lógica del cliente WebSocket
```

## Protocolo de mensajes

El chat utiliza mensajes JSON con los siguientes tipos:

### Mensajes del cliente al servidor:
- `chat`: Enviar mensaje de chat
- `setUsername`: Cambiar nombre de usuario

### Mensajes del servidor al cliente:
- `chat`: Mensaje de chat de otro usuario
- `system`: Mensaje del sistema (conexiones, notificaciones)
- `userCount`: Actualización del conteo de usuarios

## Características técnicas

- Reconexión automática con backoff exponencial
- Escape de HTML para prevenir XSS
- Manejo de errores robusto
- Código limpio y bien documentado
- Responsive design con CSS Grid y Flexbox