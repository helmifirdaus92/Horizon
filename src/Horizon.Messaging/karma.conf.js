// Karma configuration
// Generated on Fri Jan 18 2019 15:01:04 GMT+0200 (FLE Standard Time)

const coverage = process.env.NO_COVERAGE !== '1';
const ci = process.env.HORIZON_CI === '1';

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    karmaTypescriptConfig: {
      compilerOptions: {
        module: 'commonjs',
        sourceMap: true,
        noEmitOnError: false,
      },
      tsconfig: './tsconfig.karma.json',
      exclude: {
        mode: 'replace',
        values: [],
      },
      coverageOptions: {
        instrumentation: coverage,
      },
    },

    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },

    // list of files / patterns to load in the browser
    files: ['src/**/*.ts', 'src/**/*spec.ts'],

    // list of files / patterns to exclude
    exclude: ['src/index.ts'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.ts': 'karma-typescript',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      //
      ...(ci ? ['teamcity'] : ['progress', 'kjhtml']),
      ...(coverage ? ['coverage-istanbul'] : []),
    ],

    coverageIstanbulReporter: {
      reports: ci
        ? //
          ['json']
        : ['html'],
      dir: './coverage',
      'report-config': {
        html: { subdir: 'report-html' },
      },
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    stopOnFailure: false,
  });
};
