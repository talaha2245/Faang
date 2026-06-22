const express = require('express');
const cors = require('cors');
const MainRouter = require('./Routes/main');

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