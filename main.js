/* jslint node: true, jsx: true */
'use strict';

var React = require('react');
var test = require('./scss/app.scss');
var socketio = io.connect(location.href);

var Login = React.createClass({
  getInitialState: function () {
    return {
      status: ''
    };
  },
  componentDidMount: function () {
    var appId = '888594721196546';
    if (window.location.href.indexOf('localhost') > -1) {
      appId = '888596744529677';
    }

    window.fbAsyncInit = function () {
      FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v2.3'
      });

      this.checkLoginState();
    }.bind(this);

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  },
  checkLoginState: function () {
    FB.getLoginStatus(function (response) {
      this.statusChangeCallback(response);
    }.bind(this));
  },
  statusChangeCallback: function (response) {
    if (response.status === 'connected') {
      this.getUserFromAPI();
    } else if (response.status === 'not_authorized') {
      this.updateStatus('Please log into this app.');
    }
  },
  updateStatus: function (status) {
    this.setState({
      status: status
    });
  },
  getUserFromAPI: function () {
    this.updateStatus('Fetching your information...');
    FB.api('/me', function (user) {
      FB.api('/me/friends', function (friends) {
        FB.api('/me/picture', function (picture) {
          this.updateStatus('Success!');
          user.friends = friends;
          user.picture = picture.data.url;
          this.props.setUser(user);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },
  handleClick: function () {
    FB.login(function () {
      this.checkLoginState();
    }.bind(this), {
      scope: 'public_profile, email, user_friends'
    });
  },
  render: function () {
    return (
      <div id="login" className="login">
        <h2>Welcome to Transient</h2>
        <p>Minimal social :)</p>
        <br />
        <button 
          className="facebook-login" 
          onClick={this.handleClick}>
          Login Using Facebook
        </button>
        <p>{this.state.status}</p>
      </div>
    );
  }
});

// Load and use polyfill for ECMA-402.
if (!global.Intl) {
  global.Intl = require('intl');
}

var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedRelative = ReactIntl.FormattedRelative;

var Message = React.createClass({
  mixins: [IntlMixin],
  tick: function () {
    this.setState({
      tick: true
    });
  },
  componentDidMount: function () {
    this.interval = setInterval(this.tick, 1000);
  },
  componentWillUnmount: function () {
    clearInterval(this.interval);
  },
  render: function () {
    var message = this.props.message;
    return (
      <li className={this.props.isUser ? 'you' : 'other'}>
      <img style={{height:'35px'}} src={message.picture} />
      <span><strong>{message.username}</strong></span>
      <h5><FormattedRelative value={message.sentOn} /></h5>
      <p>{message.message}</p>
    </li>
    );
  }
});

var statusReset;

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

var typing;

function handleTyping(e) {
  clearTimeout(typing);
  socketio.emit('typing');
  typing = setTimeout(function () {
    socketio.emit('stop typing');
  }, 2000);
}

var Chat = React.createClass({
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

var App = React.createClass({
  getInitialState: function () {
    return {};
  },
  componentDidMount: function () {
    var user = JSON.parse(localStorage['facebookUser'] || '');
    if (user) {
      this.setUser(user);
    }
  },
  setUser: function (user) {
    localStorage['facebookUser'] = JSON.stringify(user);
    this.setState({
      user: user
    });
  },
  render: function () {
    var user = this.state.user;
    if (user) {
      return <Chat user={this.state.user} />
    } else {
      return <Login setUser={this.setUser} />;
    }
  }
});

React.render(<App />, document.getElementById('chat'));