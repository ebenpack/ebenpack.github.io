const path = require('path');

const jsDir = path.resolve(__dirname, 'js');
const jsSiteDir = path.resolve(__dirname, '_site/js');

module.exports = {
    mode: 'production',
    entry: ['regenerator-runtime', path.resolve(jsDir, 'main.js')],
    output: {
        filename: 'bundle.js',
        path: jsSiteDir,
        library: 'main',
        publicPath: '/js/'
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    }
};