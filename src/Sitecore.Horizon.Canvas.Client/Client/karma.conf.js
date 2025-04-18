const coverage = process.env.NO_COVERAGE !== '1';
const ci = process.env.HORIZON_CI === '1';

const webpackConf = require('./webpack.config.js')({}, { mode: 'development' });

webpackConf.module.rules.find((x) => x.loader === 'ts-loader').options.configFile = 'tsconfig.karma.json';

module.exports = (config) => {
  config.set({
    files: ['src/**/*.spec.ts'],
    frameworks: ['jasmine', 'webpack'],
    preprocessors: { '**/*.spec.ts': ['webpack', 'sourcemap'] },

    webpack: {
      module: webpackConf.module,
      resolve: webpackConf.resolve,
      performance: webpackConf.performance,
      context: webpackConf.context,
      devtool: 'inline-source-map',
    },
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only',
    },
    performance: {
      hints: false,
      splitChunks: false,
    },

    reporters: [...(ci ? ['teamcity'] : ['progress', 'kjhtml']), ...(coverage ? ['coverage-istanbul'] : [])],
    specReporter: {
      maxLogLines: 10, // limit number of lines logged per test
      suppressErrorSummary: true, // do not print error summary
      suppressFailed: false, // do not print information about failed tests
      suppressPassed: true, // do not print information about passed tests
      suppressSkipped: true, // do not print information about skipped tests
      showSpecTiming: false, // print the time elapsed for each spec
    },

    coverageIstanbulReporter: {
      reports: ci
        ? //
        ['json']
        : ['html', 'text-summary'],
      dir: './coverage',
      'report-config': {
        html: { subdir: 'report-html' },
        teamcity: { subdir: '.', file: 'teamcity.txt' },
      },
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    concurrency: Infinity,
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
  });
};
