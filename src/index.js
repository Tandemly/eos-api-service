// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () => console.info(`server started on port ${port} (${env})`));

// TODO: Better solution?
// Running via nodemon (sometimes pm2) dying does
// not properly stop underlying node processes, this is
// a work-around
function stopHandler() {
  console.log('Stopped forcefully');
  process.exit(0);
}
process.on('SIGTERM', stopHandler);
process.on('SIGINT', stopHandler);
process.on('SIGHUP', stopHandler);

/**
* Exports express
* @public
*/
module.exports = app;
