function statusChangeCallback(response) {
  if (response.status === 'connected') {
    getUserFromAPI();
  } else if (response.status === 'not_authorized') {
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this app.';
  } else {
    document.getElementById('status').innerHTML = 'Please log ' +
      'into Facebook.';
  }
}

function checkLoginState() {
  FB.getLoginStatus(function (response) {
    statusChangeCallback(response);
  });
}

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

  FB.getLoginStatus(function (response) {
    statusChangeCallback(response);
  });
};

(function (d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
var statusReset;

function log(message) {
  if (statusReset) {
    clearTimeout(statusReset);
  }
  var status = document.getElementById('userstatus');
  status.innerHTML = message;
  statusReset = setTimeout(function () {
    status.innerHTML = '';
  }, 1000);
}

var user, socketio = io.connect(location.href);

socketio.on("message_to_client", function (data) {
  addMessage(data);
});

socketio.on("init_client", function (data) {
  var messages = data.messages || [];
  messages.map(addMessage);
});

socketio.on('user joined', function (data) {
  log(data.username + ' joined.');
});

socketio.on('user left', function (data) {
  log(data.username + ' left.');
});

socketio.on('typing', function (data) {
  log(data.username + ' typing.');
});

socketio.on('stop typing', function (data) {
  log('');
});

function getUserFromAPI() {
  if (!user) {
    document.getElementById('status').innerHTML = 'Fetching your information.... ';
    FB.api('/me', function (response) {
      user = response;
      socketio.emit('login', user);

      document.getElementById('status').innerHTML = 'Success!';

      document.getElementById('chat').style.display = 'inherit';
      document.getElementById('login').style.display = 'none';

      var msgElem = document.getElementById('message_input');
      msgElem.addEventListener('focusout', function (event) {
        if (msgElem.innerText.trim()) {
          var sendBtn = document.getElementById('send-button');
          sendBtn.style.display = 'inherit';
          sendBtn.scrollIntoView(true);
        }
      });

      msgElem.addEventListener('focusin', function (event) {
        document.getElementById('send-button').style.display = 'none';
        msgElem.scrollIntoView(true);
      });

      var typing;
      msgElem.addEventListener('input', function (event) {
        clearTimeout(typing);
        socketio.emit('typing');
        typing = setTimeout(function () {
          socketio.emit('stop typing');
        }, 2000);
      });
    });
  }
}

function handleTyping(event) {
  if (event.keyCode === 13) {
    typing = false;
    sendMessage(event);
    socketio.emit('stop typing');
  }
}

function addMessage(msg) {
  var chatlog = document.getElementById("chatlog"),
    li = document.createElement('li');
  // var = elemPos = document.getElementById('chatform');
  li.className = msg.userId === user.id ? 'you' : 'other';
  li.innerHTML = msg.username + ' (' + msg.sentOn + '): ' + msg.message;
  chatlog.appendChild(li);
  // window.scrollTo(0, elemPos);
  document.getElementById('message_input').scrollIntoView(true);
  document.getElementById('message_input').focus();
}

function sendMessage(event) {
  event.preventDefault();
  if (user) {
    var msgElem = document.getElementById("message_input");
    socketio.emit("message_to_server", {
      message: msgElem.innerText,
      sentOn: new Date(),
      username: user.name,
      userId: user.id
    });
    msgElem.innerText = '';
  }
}