const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
	return {
		entry: "./src/index.js",
		performance: {
			hints: false,
		},
		optimization: {
			runtimeChunk: 'single',
			splitChunks: {
				chunks: 'all',
			},
		},
		devServer: {
			historyApiFallback: true,
			port: env.PORT || 4001,
			allowedHosts: "all",
			proxy: [
				{
					context: ["/api"],
					target:
						process.env.services__api__https__0 ||
						process.env.services__api__http__0,
					pathRewrite: {"^/api": ""},
					secure: false,
				},
			],
		},
		output: {
			path: `${__dirname}/dist`,
			filename: '[name].bundle.js',
			publicPath: '/'
		},
		plugins: [
			new HTMLWebpackPlugin({
				template: "./src/index.html",
				favicon: "./src/favicon.ico",
			}),
		],
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: [
								"@babel/preset-env",
								["@babel/preset-react", {runtime: "automatic"}],
							],
						},
					},
				},
				{
					test: /\.css$/,
					exclude: /node_modules/,
					use: ["style-loader", "css-loader"],
				},
			],
		},
	};
};
