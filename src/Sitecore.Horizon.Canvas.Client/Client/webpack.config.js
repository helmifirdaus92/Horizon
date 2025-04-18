const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
  context: path.resolve('./src'),
  entry: {
    'horizon.canvas': './main.ts',
    'horizon.canvas.preview': './app-preview-mode/main.preview.ts',
    'horizon.canvas.orchestrator': './app-orchestrator/main.orchestrator.ts',
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {},
      },
      {
        test: /\.(svg|woff|woff2|eot|ttf|otf)/,
        type: 'asset/inline',
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]--[hash:base64:5]',
              },
            },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                includePaths: [path.join(__dirname, 'src/app/scss')],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimizer: [new TerserPlugin({ extractComments: true })],
  },
  performance: {
    hints: 'error',
    maxEntrypointSize: 2400 * 1024,
    maxAssetSize: 2400 * 1024,
  },
  devServer: {
    host: 'localhost',
    static: path.join(__dirname), // Adjust the path as needed
    compress: true,
    port: process.env.PORT,
    allowedHosts: 'all',
    server: {
      type: process.env.HTTPS === 'false' ? 'http' : 'https',
      options: {
        pfx: '../../../dev-cert.pfx',
        passphrase: '12345',
      },
    },
    setupMiddlewares: function (middlewares, devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      const port = devServer.options.port;
      console.log(`Project is running at https://localhost:${port}/`);

      return middlewares;
    },
    client: {
      overlay: {
        runtimeErrors: (error) => {
          // CKEditor webpack issue
          if (error.message.includes('ResizeObserver loop')) {
            console.log(error.message);
            return false;
          }
          return true;
        },
      },
    },
  },
  plugins: [...(process.env.ANALYZE_BUNDLE ? [new BundleAnalyzerPlugin()] : [])],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'eval-source-map';
    config.performance.hints = false;
  }
  return config;
};
