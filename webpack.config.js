const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'example/main.jsx'),
  output: {
    path: path.resolve(__dirname, 'example'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    static: path.join(__dirname, 'example'),
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
          test: /\.html$/,
          exclude: /node_modules/,
          use: [
              {
                  loader: "html-loader",
                  options: {
                      sources: {
                          list: [
                              {
                                  tag: "source",
                                  attribute: "src",
                                  type: "src"
                              }
                          ]
                      }
                  }
              }
          ]
      }, 
      {
        test: /\.(mov|mp4)$/, use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ]
  }
};