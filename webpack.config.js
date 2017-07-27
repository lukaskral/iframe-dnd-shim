var path = require("path");
var webpack = require("webpack");
var packageConf = require("./package.json");

var WEBPACK_WATCH = process.env.WEBPACK_WATCH || null;

var config = {
    entry: {
        'index': './src/index.ts',
    },
    output: {
        publicPath: 'dist/',
        filename: "[name].js",
        path: __dirname + "/dist",
        sourceMapFilename: "[name].sourcemap.js",
        library: 'pg-face',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins: [],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    externals: {
        // fill with peer dependencies from package.json
    },
    watch: WEBPACK_WATCH === 'true'
};

for (var peerDependency of Object.keys(packageConf.peerDependencies)) {
    config.externals[peerDependency] = peerDependency;
}

function DtsBundlePlugin() {}

DtsBundlePlugin.prototype.apply = function(compiler) {
    compiler.plugin('done', function() {
        var dts = require('dts-bundle');

        dts.bundle({
            name: 'index',
            main: 'dist/dist/index.d.ts',
            out: '../index.d.ts',
            outputAsModuleFolder: true
        });
    });
};

config.plugins.push(new DtsBundlePlugin());
module.exports = config;
