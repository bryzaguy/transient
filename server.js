var http = require('http'),
  fs = require('fs'),
  sanitize = require('validator').sanitize;

var app = http.createServer(function (request, response) {
  fs.readFile("client.html", 'utf-8', function (error, data) {
    response.writeHead(200, {
      'Content-Type': 'text/html'
    });
    response.write(data);
    response.end();
  });
}).listen(process.env.PORT || 1337);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
  socket.on('message_to_server', function (data) {
    var escaped_message = sanitize(data.message).escape();
    io.sockets.emit("message_to_client", {
      message: escaped_message,
      sentOn: data.sentOn || new Date(),
      username: data.username || 'anonymous-' + socket.handshake.address
    });
  });
});