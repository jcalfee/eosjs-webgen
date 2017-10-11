const assert = require('assert')
const bip39 = require('bip39')
const {key_utils, PrivateKey} = require('eosjs-ecc')
const DKey = require('./dkey')

/**
  @arg {number} wordCount - commonly: 12, 18, or 24
  @arg {number} [cpuEntropyBits = bits(wordCount)] - 0 for quick testing
*/
export function randomMnemonic(wordCount = 24, cpuEntropyBits) {
  const wordsToBits = {
    12: 128,
    15: 160,
    18: 192,
    21: 224,
    24: 256
  }

  const bits = wordsToBits[wordCount]
  if(!bits) {
    throw new TypeError('Invalid wordCount, try one of these: ' + Object.keys(wordsToBits).join(', '))
  }

  if(cpuEntropyBits == null) {
    cpuEntropyBits = bits
  }

  assert.equal(typeof wordCount, 'number', 'mnemonic')
  assert.equal(typeof cpuEntropyBits, 'number', 'mnemonic')

  let privateBuf = key_utils.random32ByteBuffer({cpuEntropyBits})
  privateBuf = privateBuf.slice(0, bits / 8)
  const mnemonic = bip39.generateMnemonic(bits, () => privateBuf)
  try {
    // mnemonicToEntropy throws if there is a decoding error
    const entropy = bip39.mnemonicToEntropy(mnemonic)
    if(entropy !== privateBuf.toString('hex')) {
      throw new Error('miss-match')
    }
    return mnemonic
  } catch(error) {
    // should never never never happen
    /* istanbul ignore next */
    console.error(`severe error privateBuf ${privateBuf.toString('hex')}`);
    console.error(error);
    throw error
  }
}

/**
  @return {function(path)} returns sha256(seed + path)
*/
export function mnemonicSeed(mnemonic, passphrase = '') {
  assert.equal(typeof mnemonic, 'string', 'mnemonic')
  assert.equal(typeof passphrase, 'string', 'passphrase')

  const seedBuffer = bip39.mnemonicToSeed(mnemonic, passphrase)
  const dkey = DKey.fromMasterSeed(seedBuffer)
  
  return path => {
    const getters = privateKeyGetters(dkey(path))
    return Object.assign({}, {path}, getters)
  }
}

function Cache() {
  const c = {}
  return (key, data) => c[key] ? c[key] : c[key] = data()
}

function privateKeyGetters(IL) {
  const cache = Cache()
  const privateKey = ()=> cache('prv', () => PrivateKey.fromBuffer(IL))
  const publicKey = ()=> cache('pub', ()=> privateKey().toPublic())

  return {
    get wif() {
      return privateKey().toString()
    },
    get pubkey() {
      return publicKey().toString()
    },
    get pubkeyBuffer() {
      return publicKey().toBuffer()
    },
    pubkeyPrefix: prefix => publicKey().toString(prefix),
  }
}
