const args = require('minimist')(process.argv.slice(2));
const execa = require('execa')
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const targets = args._[0] || []
const sourceMap = args.sourcemap || args.s
const formats = args.formats || args.f
const allTargets = ['shared', 'core', 'browser']
const NODE_ENV = args.NODE_ENV || 'production'
const isRelease = args.release
const buildTypes = args.t || args.types || isRelease

run()

async function run() {
    if (!targets.length) {
        await buildAll(allTargets)
    } else {
        await buildAll(checkTarget(targets))
    }
}

function checkTarget(target) {
    if (!Array.isArray(target)) {
        target = [target]
    }
    return [...new Set(target.filter((item) => allTargets.includes(item)))]
}

async function buildAll(targets) {
    await runParallel(require('os').cpus().length, targets, build)
}

async function runParallel(maxConcurrency, source, iteratorFn) {
    const ret = []
    const executing = []
    for (const item of source) {
        const p = Promise.resolve().then(() => iteratorFn(item))
        ret.push(p)

        if (maxConcurrency <= source.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1))
            executing.push(e)
            if (executing.length >= maxConcurrency) {
                await Promise.race(executing)
            }
        }
    }
    return Promise.all(ret)
}

async function build(target) {
    const pkgDir = path.resolve(__dirname, '../packages', target)
    const pkg = require(path.resolve(pkgDir, 'package.json'))
    await execa(
        'rollup',
        [
            '-c',
            '--environment',
            [
                `NODE_ENV:${NODE_ENV}`,
                `TARGET:${target}`,
                formats ? `FORMATS:${formats}` : ``,
                buildTypes ? `TYPES:true` : ``,
                sourceMap ? `SOURCE_MAP:true` : ``
            ]
                .filter(Boolean)
                .join(',')
        ],
        { stdio: 'inherit' }
    )
    if (buildTypes && pkg.types) {
        const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')

        const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`)
        const extractorConfig =
            ExtractorConfig.loadFileAndPrepare(extractorConfigPath)
        const extractorResult = Extractor.invoke(extractorConfig, {
            localBuild: true,
            showVerboseMessages: true
        })
        if (extractorResult.succeeded) {
            const typesDir = path.resolve(pkgDir, 'types')
            if (await fs.exists(typesDir)) {
                const dtsPath = path.resolve(pkgDir, pkg.types)
                const existing = await fs.readFile(dtsPath, 'utf-8')
                const typeFiles = await fs.readdir(typesDir)
                const toAdd = await Promise.all(
                    typeFiles.map(file => {
                        return fs.readFile(path.resolve(typesDir, file), 'utf-8')
                    })
                )
                await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'))
            }
            console.log(
                chalk.bold(chalk.green(`API Extractor completed successfully.`))
            )
        }

        // await fs.remove(`${pkgDir}/dist/packages`)
    }
}