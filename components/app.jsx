/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
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