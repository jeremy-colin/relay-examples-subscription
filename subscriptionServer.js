import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

import { schema } from './data/schema';

const WS_PORT = 5000;

export default graphQLServer => {
  // Create WebSocket listener server
  const websocketServer = createServer(graphQLServer);

  // Bind it to port and start listening
  websocketServer.listen(WS_PORT, () => {
    console.log(
      `Websocket Server is now running on http://localhost:${WS_PORT}`
    );

    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server: websocketServer,
        path: '/sub',
      }
    );
  });
};
