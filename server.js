var http = require('http'),
    fs = require('fs'),
    validator = require('validator'),
    messages = [];

var app = http.createServer(function (request, response) {
  
  if(request.url === '/css/app.css') {
    fs.readFile("css/app.css", 'utf-8', function (error, data) {
      response.writeHead(200, {
        'Content-Type': 'text/css'
      });
      response.write(data);
      response.end();
    });
  } else  {
    fs.readFile("client.html", 'utf-8', function (error, data) {
      response.writeHead(200, {
        'Content-Type': 'text/html'
      });
      response.write(data);
      response.end();
    });
  }

}).listen(process.env.PORT || 1337);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {

  socket.emit("init_client", {
    messages: messages
  });

  socket.on('message_to_server', function (data) {
    var escaped_message = validator.escape(data.message);
    var message = {
      message: escaped_message,
      sentOn: validator.escape(data.sentOn) || new Date(),
      username: validator.escape(data.username),
      userId: validator.escape(data.userId)
    };
    messages.push(message);
    io.sockets.emit("message_to_client", message);
  });
});