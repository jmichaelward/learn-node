const math = require('./math');
const express = require('express');
const logger = require('morgan');
const app = express();

app.use(logger('dev'));
app.get('/fibonacci/:n', (request, response, next) => {
  math.fibonacciAsync(Math.floor(request.params.n), (error, value) => {
    if (error) {
      next(`FIBO SERVER ERROR ${error}`);
    } else {
      response.send({
        n: request.params.n,
        result: value
      });
    }
  });
});

app.listen(process.env.SERVERPORT);
