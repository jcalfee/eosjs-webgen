const assert = require('assert')
const createHash = require('create-hash')
const createHmac = require('create-hmac')

module.exports = DKey

/**
  @return {function(path)} returns sha256(seed + path)
*/
function DKey(seed) {
  assert(Buffer.isBuffer(seed), 'Buffer', 'buffer seed required')
  assert.equal(seed.length, 64, 'seed should be 512 bytes')

  const IL = seed.slice(0, 32)

  return path => {
    assert.equal(typeof path, 'string', 'string path required')
    assert(path.indexOf(' ') === -1, 'path should not have spaces')

    return createHash('sha256').update(IL).update(path).digest()
  }
}

/**
  @return {function(path)} returns sha256(seed + path)
*/
DKey.fromMasterSeed = function(seedBuffer) {
  assert(Buffer.isBuffer(seedBuffer), 'Buffer', 'buffer seed required')
  assert.equal(seedBuffer.length, 64, 'seed should be 512 bytes')

  const MASTER_SALT = 'Deterministic seed'
  const seed = createHmac('sha512', MASTER_SALT).update(seedBuffer).digest()
  return DKey(seed)
}
