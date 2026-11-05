const assert = require('node:assert/strict')
const manifest = require('../package.json')
const lock = require('../package-lock.json')
const expected = '0.1.0-rc.11'
assert.equal(manifest.dependencies['@rafaelaugusto/jolt'], expected)
assert.equal(manifest.overrides['@rafaelaugusto/jolt'], expected)
assert.equal(lock.packages['node_modules/@rafaelaugusto/jolt'].version, expected)
assert.equal(require('@rafaelaugusto/jolt/package.json').version, expected)
console.log(`Auralis: NativeScript-Vue + Jolt ${expected}`)
