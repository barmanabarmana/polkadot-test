const commonjs = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve').default
const typescript = require('@rollup/plugin-typescript')
const json = require('@rollup/plugin-json')
const nodePolyfills = require('rollup-plugin-polyfill-node');
const pluginInject = require("@rollup/plugin-inject")
const path = require("path")


const production = !process.env.ROLLUP_WATCH


// ignore some rollup warnings
const onwarnRollup = (warning, onwarn) => {
    // prevent warn: (!) `this` has been rewritten to `undefined`
    if (warning.code === 'THIS_IS_UNDEFINED') {
        return false
    }
    if (warning.code === 'EVAL') {
        return false
    }
    if (warning.code === 'FILE_NAME_CONFLICT' && /\b[\da-f]{8}\.(jpe?g|svg|png|gif)\b/i.test(warning.message)) {
        return false
    }
    if (warning.code === 'PLUGIN_WARNING' && warning.plugin === 'typescript' && /\bsourceMap\b/i.test(warning.message)) {
        return false
    }

    console.log(JSON.stringify(warning, null, 4))

    return onwarn(warning)
}

module.exports = {
    input : 'index.ts',
    output: {
        sourcemap: true,
        format   : 'iife',
        name     : 'app',
        file     : 'bundle.js',
    },

    plugins: [
        json(),
        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        // resolve({
        //     resolveOnly: [/.*/],
        //     extensions : ['.ts', '.js', '.mjs', '.cjs'],
        //     browser    : true,
        // }),
        //nodePolyfills(),
        commonjs({extensions: ['.ts', '.js', '.mjs', '.cjs']}),

        pluginInject({
            buffer: path.resolve(process.cwd(), 'node_modules/@polkadot/x-bundle/buffer.js'),
            Buffer: path.resolve(process.cwd(), 'node_modules/@polkadot/x-bundle/buffer.js'),
            crypto: path.resolve(process.cwd(), 'node_modules/@polkadot/x-bundle/crypto.js'),
            inherits: path.resolve(process.cwd(), 'node_modules/@polkadot/x-bundle/inherits.js')
        }),
        resolve({
            browser   : true,
            extensions: ['.ts', '.js', '.mjs', '.cjs'],
            buffer: false,
            process: false

        }),
        typescript({
            sourceMap    : !production,
            inlineSources: !production,
        }),


        // If we're building for production (npm run build
        // instead of npm run dev), minify
    ],
    onwarn  : onwarnRollup,
}
