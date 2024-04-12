import dsv from '@rollup/plugin-dsv';

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [dsv()]
};
