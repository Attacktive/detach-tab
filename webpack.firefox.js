import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default merge(common, {
	mode: 'production',
	output: {
		path: __dirname + '/dist-firefox',
		filename: '[name].js'
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: './src/manifests/manifest.firefox.json',
					to: 'manifest.json'
				},
				{
					from: './src/icons',
					to: 'icons'
				}
			]
		})
	]
});
