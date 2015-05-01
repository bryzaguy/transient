/* jslint node: true, jsx: true */
'use strict';

var React = require('react'),
    App = require('./components/app.jsx');

require('./scss/app.scss');

React.render(<App />, document.getElementById('chat'));
