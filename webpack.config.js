const InlineChunkHtmlPlugin = require('inline-chunk-html-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui/index.tsx', // The entry point for the UI code
    main: './src/main/controller.ts', // The entry point for the plugin code
  },

  module: {
    rules: [
      { 
        test: /\.tsx?$/, 
        use: 'ts-loader', 
        exclude: /node_modules/ 
      },
      { 
        test: /\.css$/, 
        use: ['style-loader', { loader: 'css-loader' }] 
      },
      { 
        test: /\.(png|jpg|gif|webp|svg)$/, 
        type: 'asset/inline'
      },
    ],
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui/index.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui'],
      inject: 'body'
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin),
  ],
})