// production config
const merge = require('webpack-merge');
const webpack = require('webpack');
const { resolve } = require('path');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
	mode: 'production',
	devtool: 'source-map',
});

// "start-prod": "yarn run build && webpack-dev-server --config=configs/webpack/prod.js --http",
