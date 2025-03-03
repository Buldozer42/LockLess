const express = require('express');
const app = express();
const { connectDB } = require('./service/db');

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});