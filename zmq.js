// Input: ZMQ
const zmq = require("zeromq")
const cashaddrjs = require('cashaddrjs-slp');

const defaults = { zmqhost: "127.0.0.1", zmqport: 28339 }
const init = function(config) {
  let sock = zmq.socket("sub")
  let zmqhost = (config.zmqhost ? config.zmqhost : defaults.zmqhost)
  let zmqport = (config.zmqport ? config.zmqport : defaults.zmqport)
  let connections = config.connections
  sock.connect("tcp://" + zmqhost + ":" + zmqport)
  sock.subscribe("rawtx")
  sock.on("message", async function(topic, txhash, json) {
    try {
      let type = topic.toString()
      txhash = txhash.toString()

      const data = JSON.parse(json.toString());

      if (config.verbose) {
        console.log(JSON.stringify(data, null, 2));
      }

      switch (type) {
        case "rawtx": {
          Object.keys(connections.pool).forEach(async function(key) {
            // we have to decode the cashaddrs down to their pubkeyhash
            // because bchaddrjs-slp treats regtest as testnet
            const inputs = data.inputs ? data.inputs.map(val => cashaddrjs.decode(val).hash) : [];
            const outputs = data.outputs ? data.outputs.map(val => cashaddrjs.decode(val).hash) : [];

            let connection = connections.pool[key]
            if (!connection.query) connection.query = {};

            if (connection.query.tokenId !== undefined && connection.query.tokenId !== data.tokenId) {
              return;
            }

            if (connection.query.slpaddr !== undefined) {
              const targetHash = cashaddrjs.decode(connection.query.slpaddr).hash;
              const addrs = [...inputs, ...outputs];
              if (!addrs.some(val => arrayEqual(targetHash, val))) {
                return;
              }
            }

            connection.res.sseSend({ type: type, data: data });
          })
          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  })
}

function arrayEqual(arr1, arr2) {
  return (arr1.length == arr2.length && arr1.every((v) => arr2.indexOf(v) >= 0));
}

module.exports = { init: init }
