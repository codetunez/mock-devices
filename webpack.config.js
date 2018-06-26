var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: ["./src/client/src/index.tsx", "./src/client/app.scss"],
    output: {
        filename: "bundle.js",
        path: __dirname + "/_dist"
    },
    devtool: "source-map",
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", "scss", "css"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { test: /\.js$/, loader: "source-map-loader" },
            {
                test: [/\.scss$/],
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            }
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'app.css',
            allChunks: true
        })
    ]
};