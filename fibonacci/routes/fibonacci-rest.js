const express = require('express');
const router = express.Router();
const http = require('http');
const math = require('../math');

router.get('/', (req, res, next) => {
  if ( req.query.fibonum ) {
    let httpRequest = http.request({
      host: 'localhost',
      port: process.env.SERVERPORT,
      path: `/fibonacci/${Math.floor(req.query.fibonum)}`,
      method: 'GET',
    });

    httpRequest.on('response', response => {
      response.on('data', chunk => {
        var data = JSON.parse(chunk);
        res.render('fibonacci', {
          title: 'Calculate Fibonacci numbers',
          fibonum: req.query.fibonum,
          fiboval: data.result,
        });
      });
      response.on('error', err => { next(err); });
    })

    httpRequest.on('error', err => { next(err); });
    httpRequest.end();
  } else {
    res.render('fibonacci', {
      title: 'Calculate Fibonacci numbers',
      fiboval: undefined
    });
  }
});

module.exports = router;
