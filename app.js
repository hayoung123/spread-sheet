const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public', 'dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
});

app.listen(8080, () => {
  console.log('express App on port 8080!');
  console.log('http://localhost:8080/');
});

console.log(path.resolve());
