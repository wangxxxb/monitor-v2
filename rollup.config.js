import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json'
import path from 'path'
import replace from '@rollup/plugin-replace'

if (!process.env.TARGET) {
    throw new Error('TARGET package must be specified via --environment flag.')
}

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const packageJson = require(path.resolve(packageDir, 'package.json'))
const packageOptions = packageJson.buildOptions
const name = packageOptions.filename || path.basename(packageDir)
const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const entry = path.resolve(packageDir, 'src/index.ts');
const shouldEmitDeclarations = packageJson.types && process.env.TYPES != null

const isProd = process.env.NODE_ENV === 'production'

const outputConfigs = {
    'esm-bundler': {
        file: path.resolve(packageDir, `dist/${name}.esm-bundler.js`),
        format: `es`
    },
    cjs: {
        file: path.resolve(packageDir, `dist/${name}.cjs.js`),
        format: `cjs`
    },
    global: {
        file: path.resolve(packageDir, `dist/${name}.global.js`),
        format: `iife`
    },
}

const rollupConfigs = packageFormats.reduce((prev, format) => {
    if (Reflect.has(outputConfigs, format)) {
        const output = outputConfigs[format]
        if (format === 'global') {
            output.name = name
        }
        if (isProd) {
            output.file = output.file.replace(/\.js$/, '.prod.js')
        }
        const plugins = [
            babel({
                exclude: "node_modules/**",
                babelHelpers: 'bundled',
            }),
            resolve(),
            commonjs(),
            json({
                namedExports: false
            }),
            typescript({
                check: isProd,
                tsconfig: path.resolve(__dirname, 'tsconfig.json'),
                cacheRoot: path.resolve(__dirname, 'node_modules/.ts2_cache'),
                tsconfigOverride: {
                  compilerOptions: {
                    target: 'es2015',
                    sourceMap: process.env.SOURCE_MAP !== null,
                    declaration: shouldEmitDeclarations,
                    declarationMap: shouldEmitDeclarations
                  },
                  exclude: ['**/__tests__']
                }
              }),
            replace({
                preventAssignment: true,
                values: {
                    'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
                    __VERSION__: `"${packageJson.version}"`
                }
            })
        ]

        if (isProd) {
            plugins.push(terser({
                module: /^esm/.test(format),
                compress: {
                    ecma: 2015,
                    pure_getters: true
                },
                safari10: true
            }))
        }
        return [
            ...prev, {
                input: entry,
                output,
                plugins
            }
        ]
    }
    return prev
}, [])

export default rollupConfigs
