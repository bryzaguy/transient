var http = require('http'),
  fs = require('fs'),
  validator = require('validator'),
  messages = [];

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

  io.sockets.emit("init_client", {
    messages: messages
  });

  socket.on('message_to_server', function (data) {
    var escaped_message = validator.escape(data.message);
    var message = {
      message: escaped_message,
      sentOn: validator.escape(data.sentOn) || new Date(),
      username: validator.escape(data.username) || 'anonymous-' + socket.handshake.address
    };
    messages.push(message);
    io.sockets.emit("message_to_client", message);
  });
});