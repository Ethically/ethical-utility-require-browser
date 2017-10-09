import { join, resolve, dirname } from 'path'
import {
    isPackage,
    isAbsolutePackage,
    appendExtension,
    getAppPrefix
} from 'ethical-utility-resolve-module'

const cache = {}
const load = (request, parent) => {
    const key = resolveFilename(request, parent)

    if (cache[key]) return cache[key].exports

    const definedModule = window.require.defined[key]
    if (!definedModule) {
        const error = new Error(`Cannot find module "${key}" from "${parent}"`)
        error.code = 'MODULE_NOT_FOUND'
        throw error
    }

    const localRequire = createLocalRequire(key)
    const module = cache[key] = { exports: {} }
    definedModule.call(module.exports, module.exports, localRequire, module)
    return module.exports
}
const resolveFilename = (key, parent) => {
    if (isAbsolutePackage(key)) return key
    //
    //
    //
    // TEST THIS
    //
    //
    //
    if (isPackage(key)) {
        return appendExtension(key)
    }

    const { alias } = window.require
    const parentAlias = (alias[parent] ? alias[parent] : parent)
    const parentFile = appendExtension(parentAlias)
    const childFile = appendExtension(key)
    const directory = dirname(parentFile)

    return join(directory, childFile)
}

export { load }

const createLocalRequire = parent => key => window.require(key, parent)
