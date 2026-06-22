import express from 'express';
import cors from 'cors';
import MainRouter from './Routes/main.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample route
app.use('/api/v1', MainRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});