import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;
const runTestImplementation = false;

function serve() {
    let server;
    function toExit() {
        if (server) server.kill(0);
    }
    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn(
                'npm',
                ['run', `start`, '--', '--dev'],
                {
                    stdio: ['ignore', 'inherit', 'inherit'],
                    shell: true,
                }
            );

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        },
    };
}

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
    plugins: bundledHelpers ? [] : [
        '@babel/plugin-transform-runtime',
    ],
});

const builds = [
    {
        external: [
            'jquery',
            /@babel\/runtime/,
        ],
        input: 'src/index.js',
        output: {
            file: 'dist/index.mjs',
            format: 'esm',
            sourcemap: true,
            inlineDynamicImports: true,
            globals: {
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
        ],
        input: 'src/index.js',
        output: {
            file: 'dist/bundle.js',
            format: 'umd',
            inlineDynamicImports: true,
            name: 'ghct2',
            sourcemap: true,
            globals: {
                jquery: '$',
            },
        },
        plugins: [
            resolve({
                browser: true,
            }),
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
    {
        external: [
            'jquery',
        ],
        input: 'src/autoload.js',
        output: {
            file: 'dist/auto-bundle.js',
            format: 'umd',
            inlineDynamicImports: true,
            name: 'ghct2',
            sourcemap: true,
            globals: {
                jquery: '$',
            },
        },
        plugins: [
            resolve({
                browser: true,
            }),
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


if (runTestImplementation && !production) {
    builds.push({
        input: 'test/test-implementation.js',
        output: {
            file: 'demo/demo-bundle.js',
            format: 'iife',
            inlineDynamicImports: true,
            name: 'ghconsentdemo',
            sourcemap: true,
        },
        plugins: [
            resolve({
                browser: true,
            }),
            babel(babelConfig(true)),
            commonjs(),

            // In dev mode, call `npm run start` once
            // the bundle has been generated
            serve(),

            // Watch the `demo` directory and refresh the
            // browser on changes when not in production
            // !production && livereload(['./demo/', './dist/']),
            livereload({
                watch: './demo/',
                exclusions: ['build/']
            }),
        ],
        context: 'window',
        watch: {
            clearScreen: false,
        },
    });
}

export default builds;
