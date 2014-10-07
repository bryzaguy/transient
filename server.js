var http = require('http');

// creates a new httpServer instance
http.createServer(function (req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.write('<h1>hello, i know nodejitsu, better and stuff.</h1>');
	res.end();
}).listen(80); // the server will listen on port 8080
// creates a new httpServer instance
http.createServer(function (req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.write('<h1>hello, i know nodejitsu, secure</h1>');
	res.end();
}).listen(443); // the server will listen on port 8080