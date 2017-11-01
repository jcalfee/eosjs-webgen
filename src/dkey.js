const assert = require('assert')
const createHash = require('create-hash')
const createHmac = require('create-hmac')

/** Derived Key Creator */
module.exports = DKey

/**
  @example dkey = DKey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic, passphrase))

  @example dkey('coin/account/role')
  @example dkey('eos/account/owner')
  @example dkey('eos/account/active')

  @return {function(path)} returns sha256(seed + path)
*/
function DKey(seed) {
  assert(Buffer.isBuffer(seed), 'Buffer', 'buffer seed required')
  assert.equal(seed.length, 32, 'seed should be 256 bytes')

  return path => {
    assert.equal(typeof path, 'string', 'string path required')
    assert(path.indexOf(' ') === -1, 'path should not have spaces')
    assert(path[0] !== '/', 'path should not start with a slash')
    assert(path[path.length - 1] !== '/', 'path should not end with a slash')
    assert(!/[A-Z]/.test(path), 'path should not have uppercase letters')
    return createHash('sha256').update(seed).update(path).digest()
  }
}

DKey.fromMasterSeed = function(seedBuffer) {
  assert(Buffer.isBuffer(seedBuffer), 'Buffer', 'buffer seed required')
  assert.equal(seedBuffer.length, 64, 'seed should be 512 bytes')

  const MASTER_SALT = 'Deterministic seed'
  const seed = createHmac('sha256', MASTER_SALT).update(seedBuffer).digest()
  return DKey(seed)
}
