var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Example route to demonstrate error handling */
router.get('/error', function(request, response, next) {
  next({
    status: 404,
    message: 'Fake error',
  })
});

module.exports = router;
