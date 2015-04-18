var http = require('http'),
  fs = require('fs');

var app = http.createServer(function (request, response) {
  fs.readFile("client.html", 'utf-8', function (error, data) {
    response.writeHead(200, {
      'Content-Type': 'text/html'
    });
    response.write(data);
    response.end();
  });
}).listen(1337);