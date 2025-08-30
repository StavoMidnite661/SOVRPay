import express from 'express';
import { createServer } from 'http';
import { router, setupWebSocket } from './routes';
import { setupVite } from './vite';

const app = express();

app.use(express.json());
app.use(router);

const server = createServer(app);
setupWebSocket(server);

setupVite(app, server);

server.listen(5000, () => {
  console.log('SOVR Pay Demo Platform is running on http://localhost:5000');
});
