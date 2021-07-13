const http = require('http');

[ 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ].forEach((path) => {
  console.log(`${new Date().toISOString()} requesting "/fibonacci/${path}"`);

  const request = http.request({
    host: 'localhost',
    port: process.env.SERVERPORT,
    path: `/fibonacci/${path}`,
    method: 'GET',
  }, response => {
    response.on('data', chunk => {
      console.log(`${new Date().toISOString()} BODY: ${chunk}`);
    });
  });
  request.end();
});


