import { join, resolve, dirname } from 'path'
import {
    isPackage,
    isAbsolutePackage,
    appendExtension,
    getAppPrefix
} from 'ethical-utility-resolve-module'

const cache = {}
const load = (request, parent = getAppPrefix()) => {
    const require = window.require
    const mapID = getModuleRoot(parent)
    const remapped = requestMap(require.browserMap, request, mapID)
    const conflicted = requestMap(require.conflictMap, remapped, mapID)
    const key = resolveFilename(conflicted, parent)

    if (cache[key]) return cache[key].exports

    const definedModule = require.defined[key]
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
const requestMap = (map, request, id) => {
    const mapped = map[id] && map[id][request]
    return mapped || request
}
const getModuleRoot = (path) => {
    const nodeModules = 'node_modules'
    const parts = path.split('/')
    const index = parts.lastIndexOf(nodeModules)
    if (index === -1) {
        return parts[0]
    }
    return parts.slice(0, index + 2).join('/')
}
const resolveFilename = (key, parent) => {
    if (isAbsolutePackage(key)) return key
    //
    //
    //
    // TODO: Test this.
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
