const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'none',
  entry: ['./src/client/app.tsx', "./src/client/app.scss"],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '_dist/client')
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', 'scss', 'css']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          instance: 'ux',
          configFile: path.resolve(__dirname, 'tsconfig.client.json')
        }
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'app.css',
      allChucks: true
    }),
  ]
};