// rollup.config.js
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';
import gzip from 'rollup-plugin-gzip';
import server from 'rollup-plugin-server';
import stripCode from 'rollup-plugin-strip-code';

const configs = {
	dev: {
		input: 'src/index.js',
		output: {
			file: 'dist/karbon.js',
			format: 'es',
			sourceMap: 'inline',
		},
		plugins: [
			
			eslint({
				exclude: 'src/styles/**'
			}),
			babel({
				exclude: 'node_modules/**',
			})
		]
	},
	prod: {
		input: 'src/index.js',
		output: {
			file: 'dist/karbon.min.js',
			format: 'es',
			sourceMap: 'inline',
		},
		plugins: [
			eslint({
				exclude: 'src/styles/**'
			}),
			babel({
				exclude: 'node_modules/**',
			}),
			stripCode({
				start_comment: 'START.DEV_ONLY',
				end_comment: 'END.DEV_ONLY'
			}),
			uglify()
		]
	},

	dist: {
		input: 'src/index.js',
		output: {
			file: 'dist/karbon.min.zipped.js',
			format: 'es',
			sourceMap: 'inline',
		},
		plugins: [
			eslint({
				exclude: 'src/styles/**'
			}),
			babel({
				exclude: 'node_modules/**',
			}),
			stripCode({
				start_comment: 'START.DEV_ONLY',
				end_comment: 'END.DEV_ONLY'
			}),
			uglify(),
			gzip()
		]
	}
};

export default [
	configs.dev,
	configs.prod,
	configs.dist
];