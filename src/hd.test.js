/* eslint-env mocha */
const {bip39} = require('bip39-checker')
const HDKey = require('hdkey')
const secp256k1 = require('secp256k1')
const createKeccakHash = require('keccak')
const assert = require('assert')

describe('bip39', () => {

  it('mnemonic to known address', () => {
    const seed = 'april twin common tattoo inch margin property quick law flush isolate topple'
    const passphrase = ''

    // tested with myetherwallet.com
    const path = `m/44'/60'/0'/0` // first address: m/44'/60'/0'/0/0
    const derivedEthAddresses = [
      '0x3151921FF0AAFB6617fC3A94942C10AA8CEf599E',
      '0x5E592ca3aE6484cCfc6a8E51CD03d3Be6FbB1682'
    ]

    const hdkey = HDKey.fromMasterSeed(bip39.mnemonicToSeed(seed, passphrase))

    for(let i = 0; i < derivedEthAddresses.length; i++) {
      const child = hdkey.derive(`${path}/${i}`)
      const publicEth = '0x' + pubToEthAddress(child.publicKey).toString('hex')
      assert.equal(publicEth.toLowerCase(), derivedEthAddresses[i].toLowerCase())
    }
  })
})

/** @see https://github.com/ethereumjs/ethereumjs-util/blob/d03528e7da885539cad141c99ea5b88829f73e72/index.js#L287
*/
const pubToEthAddress = pubKey => {
  pubKey = secp256k1.publicKeyConvert(pubKey, /*compress*/false).slice(1)
  assert(pubKey.length === 64)
  const sha3hash = createKeccakHash('keccak' + 256).update(pubKey).digest()
  return sha3hash.slice(-20) // lower 160bits
}