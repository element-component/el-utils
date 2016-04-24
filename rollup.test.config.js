import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: './test/index.js',
  dest: './lib/test.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    }),
    nodeResolve({ jsnext: true, main: true })
  ],
  format: 'umd',
  moduleName: 'ElementUtilTest'
};