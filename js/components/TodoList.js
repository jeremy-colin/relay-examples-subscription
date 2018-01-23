/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { createFragmentContainer, graphql, requestSubscription } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';

import MarkAllTodosMutation from '../mutations/MarkAllTodosMutation';

import environment from '../environment';
import Todo from './Todo';

const subscriptionQuery = graphql`
  subscription TodoListSubscription($input: AddTodoSubscriptionInput!) {
    addTodo(input: $input) {
      todo {
        id
        ...Todo_todo
      }
      clientSubscriptionId
    }
  }
`;

class TodoList extends React.Component {
  componentDidMount() {
    const subscriptionConfig = {
      subscription: subscriptionQuery,
      variables: { input: {} },
      onCompleted: data => console.log(data),
      onError: error => console.error(error),
      onNext: response => console.log(response),
      updater: (store, data) => {
        const rootField = store.getRootField('addTodo');
        const todo = rootField.getLinkedRecord('todo');
        const viewer = store.getRoot().getLinkedRecord('viewer');
        const todos = ConnectionHandler.getConnection(viewer, 'TodoList_todos');
        const edge = ConnectionHandler.createEdge(store, todos, todo);
        ConnectionHandler.insertEdgeAfter(todos, edge);
      },
    };

    requestSubscription(environment, subscriptionConfig);
  }

  _handleMarkAllChange = e => {
    const complete = e.target.checked;
    MarkAllTodosMutation.commit(
      this.props.relay.environment,
      complete,
      this.props.viewer.todos,
      this.props.viewer
    );
  };
  renderTodos() {
    return this.props.viewer.todos.edges.map(edge => (
      <Todo key={edge.node.id} todo={edge.node} viewer={this.props.viewer} />
    ));
  }
  render() {
    const numTodos = this.props.viewer.totalCount;
    const numCompletedTodos = this.props.viewer.completedCount;
    return (
      <section className="main">
        <input
          checked={numTodos === numCompletedTodos}
          className="toggle-all"
          onChange={this._handleMarkAllChange}
          type="checkbox"
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul className="todo-list">{this.renderTodos()}</ul>
      </section>
    );
  }
}

export default createFragmentContainer(TodoList, {
  viewer: graphql`
    fragment TodoList_viewer on User {
      todos(
        first: 2147483647 # max GraphQLInt
      ) @connection(key: "TodoList_todos") {
        edges {
          node {
            id
            complete
            ...Todo_todo
          }
        }
      }
      id
      totalCount
      completedCount
      ...Todo_viewer
    }
  `,
});
