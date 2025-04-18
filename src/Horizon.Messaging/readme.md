# Horizon Messaging

## Overview

Horizon.Messaging is a library to establish communication between two endpoints, which might exist on different origins (but don't have to). The main motivation was to have nice communication API between Horizon application and Canvas.

The library is built in a way that it's very generic and might be used to communicate with extensions in future.

## Design

### Glossary

Library operates with the following concepts:

- Host - an entity, which aggregates multiple connections and allows to orchestrate them. Only one `Host` per page is allowed.
- Client - an entity, which connects to the remote `Host`. Each client has its name to uniquely identify it.
- Connection - a link between `Host` and `Client`. Connection is initiated by the client and only one connection between given `Host` and `Client` is allowed. If another client with the same name connects to the `Host`, the previous connection is dropped.
- Channel - a virtual scope over the existing connection to isolate various API namespaces. Channels supports following API:
  - Events - ability to raise and listen on remote events. It's possible also to raise events either synchronously and wait till all the handlers proceeded.
  - RPC (Remove Procedure Call) - ability to invoke remote method as if it's a local one and wain on the reply using promises.

### Connection

Connection is initiated by `Client`. At this stage a process of the handshake starts when `Client` tries to exchange messages with `Host`. Whenever `Host` replies the connection is considered as established. If `Host` doesn't reply timely, `Client` retries again.

Once connection is established, all the pending events and RPC calls are sent.

This design allows to not bother about `Host` being initialized with a delay and our messages being lost.

All the messaging happens using the `MessageChannel` browser feature, as it appears to work faster than `window.postMessage()`. Also it allows to isolate channels physically.

## Demo

Refer to the `demo` folder to see messaging in action. To run it use `npm start` command.

## Deployment

Bump the version using `npm version [major|minor|patch]` and just push code to `master`. Our CI pipeline will build and push package to NPM registry if local version is newer than the version in feed.

Notice, if you push new changes without bumping the version, they will be published on next version bump only.
