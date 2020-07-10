// development config
const merge = require('webpack-merge');
const webpack = require('webpack');
const commonConfig = require('./common');

module.exports = merge(commonConfig, {
	mode: 'development',
	// entry: [
	// 	// 'react-hot-loader/patch', // activate HMR for React
	// 	// 'babel-polyfill',
	// 	// 'webpack-dev-server/client?http://localhost:8080', // bundle the client for webpack-dev-server and connect to the provided endpoint
	// 	// // 'webpack/hot/only-dev-server', // bundle the client for hot reloading, only- means to only hot reload for successful updates
	// 	'./index.tsx' // the entry point of our app
	// ],
	devServer: {
		hot: true // enable HMR on the server,
		// contentBase: '../../dist'
	},
	devtool: 'inline-source-map',
	plugins: [
		new webpack.HotModuleReplacementPlugin(), // enable HMR globally
		new webpack.NamedModulesPlugin(), // prints more readable module names in the browser console on HMR updates
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"development"'
		})
	]
});
