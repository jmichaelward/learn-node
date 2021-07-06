const express = require('express');
const router = express.Router();

const math = require('../math');

router.get('/', (request, response, next) => {
  if (request.query.fibonum) {
    // Calculate using async-aware function, in this server
    math.fibonacciAsync(request.query.fibonum, (error, fiboval) => {
      if (error) {
        next(error);
      } else {
        response.render('fibonacci', {
          title: "Calculate Fibonacci numbers",
          fibonum: request.query.fibonum,
          fiboval: fiboval,
        })
      }
    })
  } else {
    response.render('fibonacci', {
      title: "Calculate Fibonacci numbers",
      fiboval: undefined
    })
  }
});

module.exports = router;
