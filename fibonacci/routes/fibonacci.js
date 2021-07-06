const express = require('express');
const router = express.Router();

const math = require('../math');
router.get('/', (request, response, next) => {
  if (request.query.fibonum) {
    response.render('fibonacci', {
      title: "Calculate Fibonacci numbers",
      fibonum: request.query.fibonum,
      fiboval: math.fibonacci(request.query.fibonum)
    });
  } else {
    response.render('fibonacci', {
      title: "Calculate Fibonacci numbers",
      fiboval: undefined,
    })
  }
});

module.exports = router;
