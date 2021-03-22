const server = require('./server.js');
const zmq = require('./zmq.js');

const config = {
  app: undefined,
  connections: {
    pool: {},
  },
  host: process.env.HOST || "127.0.0.1",
  port: process.env.PORT || 12401,
  heartbeat: process.env.HEARTBEAT || 10,
  zmqhost: process.env.ZMQHOST || "127.0.0.1",
  zmqport: process.env.ZMQPORT || 28339,
  verbose: process.env.VERBOSE || false
}

server.init(config);
zmq.init(config);
if (process.env.DEBUG) require('./client.js').init(config);