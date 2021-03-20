## gs++ notification service

Listens to zmq events from gs++ process and broadcasts them to subscribers as server sent events.

Service accepts optional query to narrow down the output. You can filter events to a particular SLP address or token Id.

To subscribe to the service use the following snippet:

```js
const query = {
  tokenId: "test",
  slpaddr: "test"
};

const b64 = Buffer.from(JSON.stringify(query)).toString("base64");

const eventSource = new EventSource(`http://${config.host}:${config.port}/s/${b64}`);
```
