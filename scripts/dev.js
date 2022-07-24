const args = require('minimist')(process.argv.slice(2))
const path = require('path')


const target = args._[0] || 'browser'

const format = args.f || 'global'
const entry = path.resolve(__dirname,`../packages/${target}/src/index.ts`)
const globalName = require(path.resolve(__dirname,`../packages/${target}/package.json`)).buildOptions?.name

const outputFormat =  format.startsWith('global') ? 'iife': format === 'cjs' ? 'cjs': 'esm'
const outfile = path.resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`)

const {build} = require('esbuild')

build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: {
        onRebuild(error) {
            if (!error) console.log(`rebuilt~~~~`)
        }
    }
}).then(() => {
    console.log('watching~~~')
})