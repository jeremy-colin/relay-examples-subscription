import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

import { schema } from './data/schema';

const WS_PORT = 5000;

// Create WebSocket listener server
const websocketServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});

// Bind it to port and start listening
websocketServer.listen(WS_PORT, () =>
  console.log(`Websocket Server is now running on http://localhost:${WS_PORT}`)
);

export default () => {
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: websocketServer,
      path: '/sub',
    }
  );
};
