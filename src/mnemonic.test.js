/* eslint-env mocha */
const ecc = require('eosjs-ecc')
const assert = require('assert')
const HDKey = require('hdkey')
const {normalize, bip39} = require('bip39-checker')
const {randomMnemonic} = require('./mnemonic')

describe('mnemonic', () => {
  const noCpuEntropy = 0

  for(const wordCount of [12, 15, 18, 21, 24]) {
    it(`randomMnemonic ${wordCount} words`, () => {
      const mnemonic = randomMnemonic(wordCount, noCpuEntropy)
      assert(bip39.validateMnemonic(mnemonic))
      assert.equal(wordCount, mnemonic.split(' ').length)
    })
  }

  it('with cpu entropy', () => {
    const wordCount = 12
    const cpuEntropyBits = 64
    const mnemonic = randomMnemonic(wordCount, cpuEntropyBits)
    assert(bip39.validateMnemonic(mnemonic))
    assert.equal(wordCount, mnemonic.split(' ').length)
  })

  it('validate word count', () => {
    throws(() => randomMnemonic(1), /Invalid wordCount/)
  })

  // for(let i = 0; i < 4000; i++)
  it('mnemonic to private key', () => {
    // Only 24 words will work (24 words == 32 bytes)
    const mnemonic = randomMnemonic(24, noCpuEntropy)
    const privateBuf = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex')
    const privateKey = ecc.PrivateKey.fromBuffer(privateBuf)
    assert(/^5[HJK]/.test(privateKey.toWif()))
    const privateKeyHex = privateKey.toBuffer().toString('hex')
    const mnemonic2 = bip39.entropyToMnemonic(privateKeyHex)
    assert.equal(mnemonic, mnemonic2)
  })

  // for(let i = 0; i < 4000; i++)
  it('private key to mnemonic', () => {
    const privateKey = ecc.PrivateKey.randomKey(noCpuEntropy)
    const privateKeyHex = privateKey.toBuffer().toString('hex')

    const mnemonic = bip39.entropyToMnemonic(privateKeyHex)
    assert.equal(24, mnemonic.split(' ').length)
    const entropy = bip39.mnemonicToEntropy(mnemonic)
    assert.equal(entropy, privateKeyHex)
  })

  it('zero prefixed private key', () => {
    const privateKeyHex = '00'.repeat(32)

    const mnemonic = bip39.entropyToMnemonic(privateKeyHex)
    const entropy = bip39.mnemonicToEntropy(mnemonic)
    assert.equal(entropy, privateKeyHex)

    const privateKey = ecc.PrivateKey.fromBuffer(Buffer.from(privateKeyHex, 'hex'))
    assert(/^5[HJK]/.test(privateKey.toWif()))
    assert.equal(privateKeyHex, privateKey.toBuffer().toString('hex'))
  })

})

/* istanbul ignore next */
function throws (fn, match) {
  try {
    fn()
    throw new Error('Expecting error')
  } catch (error) {
    if (!match.test(error)) {
      error.message = `Error did not match ${match}\n${error.message}`
      throw error
    }
  }
}