/* jshint node: true */
/** @jsx React.DOM */
'use strict';

var React = require('react'),
    Message = require('./message.jsx'),
    socketio = io.connect(location.href),
    statusReset,
    typing;

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

module.exports = React.createClass({
  getInitialState: function () {
    return {
      messages: []
    };
  },
  componentDidMount: function () {
    socketio.on('user joined', function (data) {
      log(data.username + ' joined.');
    });

    socketio.on("init_client", function (data) {
      if (data.messages) {
        this.setState({
          messages: data.messages
        });
      }
    }.bind(this));

    socketio.on("message_to_client", function (data) {
      var messages = this.state.messages;
      messages.push(data);
      this.setState({
        messages: messages
      });
	    scrollToBottom();
    }.bind(this));

    socketio.on('user left', function (data) {
      log(data.username + ' left.');
    });

    socketio.on('typing', function (data) {
      log(data.username + ' typing.');
    });

    socketio.emit('login', this.props.user);
  },
  sendMessage: function (e) {
    e.preventDefault();
    var msgElem = document.getElementById('message_input');

    var user = this.props.user;
    socketio.emit("message_to_server", {
      message: msgElem.innerText,
      sentOn: new Date(),
      username: user.name,
      picture: user.picture,
      userId: user.id
    });

    msgElem.innerHTML = '';
  },
  handleKeyPress: function (e) {
    if (e.which === 13) {
      typing = false;
      this.sendMessage(event);
      socketio.emit('stop typing');
    }
  },
  render: function () {
    var messages = this.state.messages;
    var user = this.props.user;
    var chatMessages = messages.map(function (msg, index) {
      return <Message message={msg} isUser={msg.userId === user.id} key={index} />;
    });
    var statusHidden = {
      display: 'none'
    };
    return (
      <div id="chat">
      <ul id="chatlog">{chatMessages}</ul>
      <form id="chatform" action="">
        <div id="userstatus" style={statusHidden}></div>
        <div id="message_input" 
             className="input-wrapper" 
             onInput={handleTyping}
             contentEditable="true" 
             onKeyPress={this.handleKeyPress}>
        </div>
        <div id="send-button" className="button-wrapper">
          <button type="submit" onClick={this.sendMessage}>Send</button>
        </div>
      </form>
    </div>
    );
  }
});