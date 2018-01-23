import { execute } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const GRAPHQL_SUBSCRIPTION_ENDPOINT = 'ws://localhost:5000/sub';

import { Environment, Network, RecordSource, Store } from 'relay-runtime';

function fetchQuery(operation, variables) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  });
}

const subscriptionClient = new SubscriptionClient(GRAPHQL_SUBSCRIPTION_ENDPOINT, {
  reconnect: true,
});

const subscriptionLink = new WebSocketLink(subscriptionClient);

// Prepar network layer from apollo-link for graphql subscriptions
const networkSubscriptions = (operation, variables) =>
  execute(subscriptionLink, {
    query: operation.text,
    variables,
  });

export default new Environment({
  network: Network.create(fetchQuery, networkSubscriptions),
  store: new Store(new RecordSource()),
});
