import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const babelConfig = (bundledHelpers = false) => ({
    babelrc: false,
    exclude: [/\/core-js\//, 'node_modules/**'],
    sourceMaps: true,
    inputSourceMap: true,
    babelHelpers: bundledHelpers ? 'bundled' : 'runtime',
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                corejs: 3,
            }
        ],
    ],
    plugins: [
        '@babel/plugin-transform-runtime',
    ],
});

export default [
    {
        external: [
            'jquery',
            /@babel\/runtime/,
        ],
        input: 'src/Factory.js',
        output: {
            file: 'dist/index.mjs',
            format: 'esm',
            globals: {
                wp: 'wp',
                jquery: '$',
            },
        },
        plugins: [
            resolve(),
            babel(babelConfig()),
            commonjs(),
        ],
    },
    {
        external: [
            'jquery',
            /@babel\/runtime/,
        ],
        input: 'src/index.js',
        output: {
            file: 'dist/bundle.js',
            format: 'iife',
        },
        plugins: [
            resolve(),
            babel(babelConfig(true)),
            commonjs(),
            production && terser({
                mangle: true,
                compress: true,
                output: {
                    comments: function (node, comment) {
                        var text = comment.value;
                        var type = comment.type;
                        if (type == 'comment2') {
                            // multiline comment
                            return (
                                /@preserve|@license|@cc_on/i.test(text) ||
                                /^!/.test(text)
                            );
                        }
                    },
                },
            })
        ],
    },
];
