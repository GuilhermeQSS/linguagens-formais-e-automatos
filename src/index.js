const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '..'))); 

app.get('/representacao1', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'representacao1', 'index.html'));
});

app.get('/representacao2', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'representacao2', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}/representacao1`);
});