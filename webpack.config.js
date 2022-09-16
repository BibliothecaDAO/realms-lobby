/* Client-side reporting */
// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const path = require('path')
const Dotenv = require('dotenv-webpack');

module.exports = {
    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    // Source maps support ('inline-source-map' also works)
    // devtool: 'source-map',

    target: 'web',
    devServer: {
        port: 8080,
        static: {
            directory: path.join(__dirname, 'client/public')
        },
        server: 'http'
    },
    output: {
        path: path.join(__dirname, "client/public/js"),
        filename: '[name].js'
    },

    entry: './client/src',

    // Add the loader for .ts files.
    module: {
        rules: [
            {
                test: /\.ts(x)?$/,
                loader: 'ts-loader'
            }
        ]
    },
    plugins: [
        new Dotenv({ systemvars: true })
    ]
}
