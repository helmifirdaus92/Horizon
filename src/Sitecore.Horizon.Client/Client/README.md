# Horizon

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.0.

## Local dependecies

> __IMPORTANT:__ Local dependencies must be build before running `npm install`.

* A local dependency is a dependency to another project in the same repository. Local dependencies are listed under `localDependencies` in `package.json`.
* Local dependencies will automatically be installed when you run `npm install` but they require the packages to already be build (if they have a build step) prior to running `npm install`.
* To add a new local dependency run `npm run install-local -- --save <path/to/local/project>`.
* Check install-local's [GitHub page](https://github.com/nicojs/node-install-local/) for more info.
* Update local dependencies by running `npm run install-local`. It will always re-install, there is no caching.

## Development server

Do not run this project directly using Angular-CLI, instead launch the `Sitecore.Horizon.Host` using dotnet core. This can be done from `Visual Studio` or with the `.NET Core CLI`. See [dotnet Core Angular project template](https://docs.microsoft.com/en-us/aspnet/core/spa/angular?view=aspnetcore-2.1&tabs=netcore-cli) for how to use .NET Core CLI.

The `Host` will run `npm start` behind the scenes.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build`. The build artifacts will be stored in the `dist/` directory. We recommend using the Brew/Cake setup in this repository for running builds.

## Running unit tests

For development purposes run `npm test`.

For CI purposes run `npm run test -- --single-run --code-coverage --reporters=teamcity`.

[Karma](https://karma-runner.github.io) is used as the test runner.

## Connected developer mode

Follow the steps below to enable the connected developer mode in your environment.

1. Have a Sitecore instance with graphql
    - [SitecoreGraphQL repository](http://tfs4dk1.dk.sitecore.net/tfs/PD-Products-01/Products/GraphQL/_git/Sitecore.Services.GraphQL)

1. In the Horizon client (this project) create a file `conf/connected-mode.conf.user.json` with the url to your Sitecore instance
    - The format of this user file should be the same as `conf/connected-mode.conf.json`
    - For example `{ "sitecoreBaseUrl": "http://sc90rev171219" }`

1. Disable authentication for the graphql endpoints in your Sitecore instance
    - Locate the file `<sitecore_instance>\Website\App_Config\Sitecore\Services.GraphQL\Sitecore.Services.GraphQL.config`
    - Set `<requireAuthentication>false</requireAuthentication>` under security => systemService

1. Enable WebSockets as a Windows feature
    - Search and open `windows features`
    - Locate *Internet Information Services > World Wide Web Services > Application Development Features*
    - Enable *WebSocket Protocol*
    - Restart IIS

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
