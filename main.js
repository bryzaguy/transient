/* jslint node: true, jsx: true */
'use strict';

var React = require('react'),
    Login = require('./components/login.jsx'),
    Message = require('./components/message.jsx'),
    Chat = require('./components/chat.jsx'),
    App = require('./components/app.jsx'),
    test = require('./scss/app.scss'),
    socketio = io.connect(location.href),
    statusReset,
    typing;

React.render(<App />, document.getElementById('chat'));

function log(message) {
  if (statusReset) {
    clearTimeout(statusReset);
  }
  var status = document.getElementById('userstatus');
  status.innerHTML = message;
  status.style.display = 'inherit';
  statusReset = setTimeout(function () {
    status.style.display = 'none';
  }, 1000);
}

function handleTyping(e) {
  clearTimeout(typing);
  socketio.emit('typing');
  typing = setTimeout(function () {
    socketio.emit('stop typing');
  }, 2000);
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}