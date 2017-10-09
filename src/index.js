import * as Module from './module.js'

const evalModules = (modules) => {
    modules.forEach(module => {
        const require = window.require
        const { id, key, alias, source } = module

        require.defineSource(key, source)
        require.ids.push(id)

        if (alias) require.alias[key] = alias
    })
}

const enableBrowserRequire = (modules) => {

    const require = (request, loaderPath) => ( Module.load(request, loaderPath) )

    require.defined = {}
    require.ids = []
    require.alias = {}
    require.define = (module, fn) => require.defined[module] = fn
    require.defineSource = (key, source) => {
        const wrappedModule = eval(
            '(function(exports,require,module){' +
                (source + '\n') +
            '}).bind(window)'
        )
        require.define(key, wrappedModule)
    }
    require.load = (url) => (
        window.fetch(url)
        .then(response => response.json())
        .then(evalModules)
        .catch(e => console.error(e))
    )

    window.require = require

    if (modules) evalModules(modules)
}

export default enableBrowserRequire

// Inspired by:
// https://github.com/efacilitation/commonjs-require
