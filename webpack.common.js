import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
	entry: {
		background: './src/background/background.ts',
		options: './src/options/options.ts'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: {
					loader: 'ts-loader',
					options: {
						configFile: 'tsconfig.webpack.json'
					}
				},
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/options/options.html',
			filename: 'options.html',
			chunks: ['options']
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: './src/options/options.css',
					to: 'options.css'
				}
			]
		})
	],
	optimization: {
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		}
	}
};
