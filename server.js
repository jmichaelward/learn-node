'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (request, response) => {
  response.send('Hello World');
});

app.get('/about', (request, response) => {
  response.send('This is my about page.');
});

app.get('/contact', (request, response) => {
  response.send('This is my contact page.');
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
