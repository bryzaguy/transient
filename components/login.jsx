/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
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