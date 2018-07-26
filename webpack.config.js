var path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: [/node_modules/, /test/, /migrations/],
        use: [
          { loader: ['babel-loader'] }
        ],
        query: {
          presets: ['env', 'react']
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]

      }
    ]
  }
}
