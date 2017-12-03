const assert = require('assert')
const createHash = require('create-hash')
const createHmac = require('create-hmac')

/**
  Derive keys from a mnemonic phrase seed.
*/
module.exports = DKey

/**
  Works with the bip39 npm package.  Use bip39 to validate then convert a
  mnemonic seed into a Buffer (the "master seed").  DKey will perform
  simple path hashing on that seed to create new private keys.

  @example dkey = DKey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic, passphrase))

  @example dkey('coin/account/role')
  @example dkey('eos/jan/owner')
  @example dkey('eos/jan/active')

  @return {function} dkey({string} path) return {Buffer} sha256(seed + path)
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

// TODO DKey.fromMnemonicPhrase(..)

/**
  @arg {Buffer} seedBuffer 64 bytes
  @example dkey = DKey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic, passphrase))
*/
DKey.fromMasterSeed = function(seedBuffer) {
  assert(Buffer.isBuffer(seedBuffer), 'Buffer', 'buffer seed required')
  assert.equal(seedBuffer.length, 64, 'seed should be 64 bytes (512 bits)')

  const MASTER_SALT = 'Deterministic seed'
  const seed = createHmac('sha256', MASTER_SALT).update(seedBuffer).digest()
  return DKey(seed)
}
