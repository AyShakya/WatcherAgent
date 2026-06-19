import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'watcher-api-backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Watcher API Server running on port ${PORT}`);
});
