var http = require('http');

// creates a new httpServer instance
http.createServer(function (req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.write('<h1>hello, i know nodejitsu.</h1>');
	res.end();
}).listen(8080); // the server will listen on port 8080
// creates a new httpServer instance
http.createServer(function (req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.write('<h1>hello, i know nodejitsu, better and stuff.</h1>');
	res.end();
}).listen(8081); // the server will listen on port 8080