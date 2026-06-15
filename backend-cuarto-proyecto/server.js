import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { init as initSocket } from './socketIo.js';

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP a partir de la app Express
const server = http.createServer(app);

// Inicializar Socket.IO con el mismo servidor HTTP
initSocket(server);

server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
