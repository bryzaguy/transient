/* jshint node: true */
/** @jsx React.DOM */
'use strict';

var React = require('react');
var Login = require('./login.jsx');
var Chat = require('./chat.jsx');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      user: JSON.parse(localStorage.facebookUser || '')
    };
  },
  setUser: function (user) {
    localStorage.facebookUser = JSON.stringify(user);
    this.setState({
      user: user
    });
  },
  render: function () {
    var user = this.state.user;
    if (user) {
      return <Chat user={this.state.user} />;
    } else {
      return <Login setUser={this.setUser} />;
    }
  }
});