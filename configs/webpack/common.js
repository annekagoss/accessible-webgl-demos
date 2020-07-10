// shared config (dev and prod)

const autoprefixer = require('autoprefixer');
const {resolve} = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {CheckerPlugin} = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CSSModuleLoader = {
	loader: 'css-loader',
	options: {
		modules: true,
		sourceMap: true,
		localIdentName: '[local]__[hash:base64:5]'
	}
};

const CSSLoader = {
	loader: 'css-loader',
	options: {
		modules: false,
		sourceMap: true
	}
};

const postCSSLoader = {
	loader: 'postcss-loader',
	options: {
		ident: 'postcss',
		sourceMap: true,
		plugins: () => [
			autoprefixer({
				browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9']
			})
		]
	}
};

module.exports = {
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx']
	},
	context: resolve(__dirname, '../../src'),
	entry: './index.tsx',
	devtool: 'eval-source-map',
	module: {
		rules: [
			{
				test: /\.(j|t)sx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						babelrc: false,
						presets: [
							[
								'@babel/preset-env',
								{targets: {browsers: 'last 2 versions'}} // or whatever your project requires
							],
							'@babel/preset-typescript',
							'@babel/preset-react'
						],
						plugins: [
							// plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
							['@babel/plugin-proposal-decorators', {legacy: true}],
							['@babel/plugin-proposal-class-properties', {loose: true}],
							'react-hot-loader/babel',
							'@babel/plugin-transform-runtime'
						]
					}
				}
			},
			{
				test: /\.scss$/,
				exclude: /\.module\.scss$/,
				use: ['style-loader', CSSLoader, postCSSLoader, 'sass-loader']
			},
			{
				test: /\.css$/,
				exclude: /\.module\.css$/,
				use: ['style-loader', CSSLoader]
			},
			{
				test: /\.module\.scss$/,
				use: ['style-loader', CSSModuleLoader, postCSSLoader, 'sass-loader']
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				type: 'javascript/auto',
				loaders: ['file-loader']
			},
			{
				test: /\.obj|.mtl$/,
				loader: 'raw-loader'
			},
			{
				test: /\.(glsl|frag|vert)$/,
				use: ['raw-loader', 'glslify-loader']
			}
		]
	},
	plugins: [new CleanWebpackPlugin(), new CheckerPlugin(), new HtmlWebpackPlugin({
		template: 'index.html.ejs',
		favicon: './assets/favicon.png'
	})],
	output: {
		filename: '[name].bundle.js',
		path: resolve(__dirname, '../../dist')
	}
};
