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

      switch (type) {
        case "rawtx": {
          Object.keys(connections.pool).forEach(async function(key) {
            data.inputs = data.inputs.map(val => scriptPubKeyToCashaddr(val));
            data.outputs = data.outputs.map(val => scriptPubKeyToCashaddr(val));

            if (config.verbose) {
              console.log(data);
            }

            let connection = connections.pool[key]
            if (!connection.query) connection.query = {};

            if (connection.query.tokenId !== undefined && connection.query.tokenId !== data.tokenId) {
              return;
            }

            if (connection.query.slpaddr !== undefined) {
              const addrs = [...data.inputs, ...data.outputs];
              if (addrs.findIndex(connection.query.slpaddr < 0))
                return;
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

function scriptPubKeyToCashaddr(script) {
  let buf = Buffer.from(script, "hex");
  let type = "";
  let hash = "";
  if (buf[0] == 0x76 && buf[1] == 0xa9) {
    type = "P2PKH";
    hash = buf.slice(3, buf.length - 2);
  } else if (buf.length == 23 && buf[0] == 0xa9 && buf[22] == 0x87) {
    type = "P2SH";
    hash = buf.slice(1, 21);
  }

  return cashaddrjs.encode("simpleledger", type, hash);
}

module.exports = { init: init }
