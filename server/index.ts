
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

const port = process.env.PORT || 5001;

server.listen(port, () => {
  console.log(`SOVR Pay Platform is running on port ${port}`);
});
