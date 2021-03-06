const { version, name, author, license, dependencies } = require('../package.json');
export const banner = `
/**
 * ${name} v${version}
 * (c) 2017-${(new Date().getFullYear())} ${author}
 * Released under ${license}
 */
`;
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
const babelConfig = {
  common: {
    presets: [
      [ 'env', {
        modules: false,
        targets: {
          browsers: [ 'last 2 versions', 'not ie <= 8' ],
        },
      }],
      'stage-0',
    ],
    exclude: 'node_modules/**',
    plugins: [
      'external-helpers',
      'transform-runtime',
      'transform-decorators-legacy',
    ],
    externalHelpers: true,
    runtimeHelpers: true,
    babelrc: false,
  },
  es: {
    presets: [
      [ 'env', {
        modules: false,
        targets: {
          browsers: [ 'last 2 versions', 'not ie <= 8' ],
        },
      }],
      'stage-0',
    ],
    exclude: 'node_modules/**',
    plugins: [
      'external-helpers',
      'transform-runtime',
      'transform-decorators-legacy',
    ],
    externalHelpers: true,
    runtimeHelpers: true,
    babelrc: false,
  },
  umd: {
    presets: [
      [ 'env', {
        modules: false,
        targets: {
          browsers: [ 'last 2 versions', 'not ie <= 8' ],
        },
      }],
      'stage-0',
    ],
    exclude: 'node_modules/**',
    plugins: [
      'external-helpers',
      'transform-runtime',
      'transform-decorators-legacy',
    ],
    externalHelpers: true,
    runtimeHelpers: true,
    babelrc: false,
  },
  iife: {
    presets: [
      [ 'env', {
        modules: false,
        targets: {
          browsers: [ 'last 2 versions', 'not ie <= 8' ],
        },
      }],
      'stage-0',
    ],
    exclude: 'node_modules/**',
    plugins: [
      'external-helpers',
      'transform-runtime',
      'transform-decorators-legacy',
    ],
    externalHelpers: true,
    runtimeHelpers: true,
    babelrc: false,
  },
  min: {
    presets: [
      [ 'env', {
        modules: false,
        targets: {
          browsers: [ 'last 2 versions', 'not ie <= 8' ],
        },
      }],
      'stage-0',
    ],
    exclude: 'node_modules/**',
    plugins: [
      'external-helpers',
      'transform-decorators-legacy',
    ],
    runtimeHelpers: true,
    babelrc: false,
  },
};
const externalRegExp = new RegExp(Object.keys(dependencies).join('|'));
export default function(mode) {
  return {
    input: 'src/index.js',
    external(id) {
      if (id === 'chimee') return true;
      return !/min|umd|iife/.test(mode) && externalRegExp.test(id);
    },
    plugins: [
      babel(babelConfig[mode]),
      commonjs(),
      replace({
        'process.env.PLAYER_VERSION': `'${version}'`,
      }),
      resolve({
        customResolveOptions: {
          moduleDirectory: /min|umd|iife/.test(mode) ? [ 'src', 'node_modules' ] : [ 'src' ],
        },
      }),
    ],
  };
}
