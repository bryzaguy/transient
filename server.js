var http = require('http'),
  fs = require('fs'),
  messages = [];

var app = http.createServer(function (request, response) {
  if (request.url === '/bundle.js') {
    fs.readFile("build/bundle.js", 'utf-8', function (error, data) {
      response.writeHead(200, {
        'Content-Type': 'text/javascript'
      });
      response.write(data);
      response.end();
    });
  } else {
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

  socket.on('login', function (user) {
    socket.username = user.name;

    socket.broadcast.emit('user joined', {
      username: socket.username
    });
    socket.emit("init_client", {
      messages: messages
    });
  });

  socket.on('message_to_server', function (data) {
    messages.push(data);
    io.sockets.emit("message_to_client", data);
  });

  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('disconnect', function () {
    socket.broadcast.emit('user left', {
      username: socket.username
    });
  });
});