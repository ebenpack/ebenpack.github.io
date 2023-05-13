
const path = require('path');

const jsDir = path.resolve(__dirname, 'src');
const jsSiteDir = path.resolve(__dirname, 'dist');

module.exports = {
    mode: 'production',
    entry: ['regenerator-runtime', path.resolve(jsDir, 'main.js')],
    output: {
        filename: 'bundle.js',
        path: jsSiteDir,
        library: 'main',
        publicPath: '/js/bundle/'
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    node: {
        fs: "empty"
    }
};