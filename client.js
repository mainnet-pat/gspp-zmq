const EventSource = require('eventsource');

const init = function(config) {
  setTimeout(() => {
    const query = {
      // tokenId: "test",
      // slpaddr: "test"
    };

    const b64 = Buffer.from(JSON.stringify(query)).toString("base64");

    const eventSource = new EventSource(`http://${config.host}:${config.port}/s/${b64}`);
    const cancelFn = () => {
      eventSource.close();
    };

    eventSource.addEventListener(
      "message",
      (txEvent) => {
        const data = JSON.parse(txEvent.data);
        console.log("client", data);
        if (data.data && data.data.length) {
          if (!!callback(data.data[0])) {
            cancelFn();
          }
        }
      },
      false
    );
  }, 2000);
}

module.exports = { init: init }