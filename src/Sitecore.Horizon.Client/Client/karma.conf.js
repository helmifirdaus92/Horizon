// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-teamcity-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reports: process.env.HORIZON_CI
        ? //
        ['json']
        : ['html'],
      fixWebpackSourcePaths: true,
      thresholds: {
        emitWarning: false,
        global: {
          statements: 75,
          branches: 50, // Bump all numbers until 80% is reached, then switch to `each`.
          functions: 70, // Bump all numbers until 80% is reached, then switch to `each`.
          lines: 75,
        },
        // To be used instead of global tresholds, when our code coverage is better.
        // each: {
        //   statements: 80,
        //   branches: 80,
        //   functions: 80,
        //   lines: 80,
        // },
      },
    },
    angularCli: {
      environment: 'dev',
    },
    reporters: process.env.HORIZON_CI
      ? // Workaround for the missing --reporters key
      ['teamcity', 'coverage-istanbul']
      : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    proxies: {
      '/Hello%20World': '/favicon.ico', // Workaround to prevent warning of non-existing `Hello World` url
    },
  });
};
