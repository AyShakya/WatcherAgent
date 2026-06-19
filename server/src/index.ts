import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { initDb } from './db/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.js';


const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'watcher-api-backend' });
});

// Mount modular API routes
app.use('/api/v1', apiRouter);

// Mount global error handler middleware (must be registered last)
app.use(errorHandler);

// Initialize PostgreSQL connection and tables
try {
  await initDb();
} catch (error) {
  console.error('⚠️ Database initialization failed. Server starting anyway...', error);
}



app.listen(PORT, () => {
  console.log(`🚀 Watcher API Server running on port ${PORT}`);
});
