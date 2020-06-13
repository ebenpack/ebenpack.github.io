const path = require('path');

const jsDir = path.resolve(__dirname, 'js');
const jsAssetsDir = path.resolve(__dirname, 'assets', 'js');

module.exports = {
    mode: 'production',
    entry: ['regenerator-runtime', path.resolve(jsDir, 'main.js')],
    output: {
        filename: 'bundle.js',
        path: jsAssetsDir,
        library: 'main',
        publicPath: '/js/'
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    }
};