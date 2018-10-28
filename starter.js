process.env.TELOGIS_USERNAME = 'apiuser4syscolabs';
process.env.TELOGIS_PASSWORD = 'S1ab320!7y5co';
process.env.TELOGIS_URL = 'http://13.229.34.207:3000/telogis-mock';
process.env.TELOGIS_AUTH_URL = 'http://13.229.34.207:3000/rest/login/sysco';

// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require('babel-register')({
  presets: ['env']
});

// Import the rest of our application.
module.exports = require('./app.js');
