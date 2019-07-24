import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const banner = `/*!
  * ${pkg.name} ${pkg.version}
  * Licensed under ${pkg.license}, https://opensource.org/licenses/${pkg.license}/
  * Please visit ${pkg.homepage} for details.
  */
  /* eslint-disable */`;

export default [
  {
    input: 'src/index.js',
    external: ['@loupthibault/linkedlist'],
    output: {
      banner: banner,
      name: 'bonnieParallax',
      file: pkg.browser,
      format: 'umd',
      esModule: false,
      globals: {
        ['@loupthibault/linkedlist']: 'LinkedList'
      }
    },
    plugins: [
      resolve(),
      commonjs(),
      babel(),
      terser({
        mangle: {
          keep_classnames: true
        },
        keep_classnames: true,
        output: {
          comments: '/^!/'
        }
      })
    ]
  },

  {
    input: 'src/index.js',
    external: ['@loupthibault/linkedlist'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' }
    ]
  }
];
