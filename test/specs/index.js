import enableBrowserRequire from '../../src/index.js'

const data = {
        modules: [{
            id: 0,
            key: '~/test/files/dist/a.js',
            source: '\'use strict\';\n\nmodule.exports = require(\'./b.js\');'
        }, {
            id: 1,
            key: '~/test/files/dist/b.js',
            source: '\'use strict\';\n\nrequire(\'ethical-noop-module-browser\');\n\nmodule.exports = require(\'./c.js\');'
        }, {
            id: 2,
            key: 'ethical-noop-module-browser',
            source: 'module.exports = require(\'./browser/file.js\')\n',
            alias: 'ethical-noop-module-browser/browser.js'
        }, {
            id: 3,
            key: 'ethical-noop-module-browser/browser/file.js',
            source: 'module.exports = \'@ethical-noop-module-browser/browser/file.js\'\n'
        }, {
            id: 4,
            key: '~/test/files/dist/c.js',
            source: '\'use strict\';\n\nrequire(\'ethical-noop-module-browser\');\n\nmodule.exports = require(\'ethical-noop-module-browser/relative\');'
        }, {
            id: 5,
            key: 'ethical-noop-module-browser/relative.js',
            source: 'module.exports = \'@ethical-noop-module-browser/relative.js\'\n'
        }
    ]
}

describe('window.require()', () => {
    beforeEach(() => {
        global.window = {}
    })
    afterEach(() => {
        delete global.window
    })
    it('should require modules', () => {
        enableBrowserRequire(data.modules)
        expect(global.window.require('~/test/files/dist/a.js'))
        .toBe('@ethical-noop-module-browser/relative.js')
    })
    it('should require cached module', () => {
        enableBrowserRequire(data.modules)
        const key = 'ethical-noop-module-browser'
        expect(global.window.require(key))
        .toBe('@ethical-noop-module-browser/browser/file.js')

        delete global.window.require.defined[key]
        // cached version
        expect(global.window.require(key))
        .toBe('@ethical-noop-module-browser/browser/file.js')
    })
    it('should load and define modules', (done) => {
        enableBrowserRequire()
        const resultObject = {
            '~/test/files/dist/a.js': jasmine.any(Function),
            '~/test/files/dist/b.js': jasmine.any(Function),
            'ethical-noop-module-browser': jasmine.any(Function),
            'ethical-noop-module-browser/browser/file.js': jasmine.any(Function),
            '~/test/files/dist/c.js': jasmine.any(Function),
            'ethical-noop-module-browser/relative.js': jasmine.any(Function)
        }
        const response = { json: () => data }
        global.window.fetch = () => Promise.resolve(response)
        global.window.require
        .load(data.modules[0].key)
        .then(() => {
            expect(global.window.require.defined)
            .toEqual(jasmine.objectContaining(resultObject))
        })
        .then(done)
        .catch(e => console.error(e))
    })
    it('should log error to console', (done) => {
        enableBrowserRequire()
        const originalConsoleError = console.error
        const error = new Error('Error!')
        console.error = (e) => expect(e).toBe(error)
        global.window.fetch = () => Promise.reject(error)
        global.window.require
        .load(data.modules[0].key)
        .then(() => { console.error = originalConsoleError })
        .then(done)
        .catch(e => {
            console.error = originalConsoleError
            console.error(e)
        })
    })
    it('should throw module not found error', () => {
        enableBrowserRequire()
        try {
            global.window.require('~/app.js')
        } catch (e) {
            expect(e.code).toBe('MODULE_NOT_FOUND')
        }
    })
})
