/** @jsx React.DOM */

var React = require('react');

// Load and use polyfill for ECMA-402.
if (!global.Intl) {
  global.Intl = require('intl');
}

var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedRelative = ReactIntl.FormattedRelative;

module.exports = React.createClass({
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