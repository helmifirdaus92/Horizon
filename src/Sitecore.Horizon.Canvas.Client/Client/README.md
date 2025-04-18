# About
This project compiles into an `horizon.bundle.js` file, which is to be injected into a Sitecore website, to enable in page editing capabilities based on Sitecore page meta data.

The project expects to run inside an iframe and communicates to the outer frame via iframe postmessage.

## Build

* __Prod build__: `npm run build`.
* __Dev build__: `npm run build:dev`.

## CI

* `npm run ci`

## Start demo

* `npm start`

When doing development run `npm start` to start a webpack dev server, which recompiles and auto-reloads when saving a file.

## Unit tests

* `npm test`

## Deploy changes
To deploy changes to a Sitecore instance run `copyfiles -u 1 dist/* <path/to/folder>`

As an example there is `deploy` script with standart path to Sitecore
* `npm run deploy:dev`
