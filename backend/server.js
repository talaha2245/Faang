import express from 'express';
import cors from 'cors';
import MainRouter from './Routes/main.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// app.get('/', (req, res) => {
//   res.json({
//     message: "Welcome to the API"
//   });
// });

// Sample route
app.use('/api/v1', MainRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});