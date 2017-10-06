/* eslint-env mocha */
const assert = require('assert')
const HDKey = require('hdkey-str')

const {bip39} = require('bip39-checker')
const secp256k1 = require('secp256k1')
const createKeccakHash = require('keccak')


describe('string path', () => {
  const hdkey = HDKey.fromMasterSeed('128bit secret')

  // m/purpose'/network'/role/account

  it('derive child', () => {
    const accountPub = '0344f990b1e973fe6b4c63073be752e1fc0a61a7860f9bfcf9746d706063e0c8fc'
    eq(hdkey.derive(`m/48'/coin'/owner`).deriveChild('kirby'), accountPub)
    eq(hdkey.derive(`m/48'/coin'/owner/kirby`), accountPub)

    const publicExt = HDKey.fromExtendedKey(hdkey.derive(`m/48'/coin'/owner`).publicExtendedKey)
    const privateExt = HDKey.fromExtendedKey(hdkey.derive(`m/48'/coin'/owner`).privateExtendedKey)

    eq(publicExt.deriveChild('kirby'), accountPub)
    eq(privateExt.deriveChild('kirby'), accountPub)
  })

  it('hardened coin', () => {
    // Can't derive a different coin from an extended key
    const correctCoin = hdkey.derive(`m/48'/coin'`).publicKey.toString('hex')
    const publicExt = HDKey.fromExtendedKey(hdkey.derive(`m/48'`).publicExtendedKey)
    const privateExt = HDKey.fromExtendedKey(hdkey.derive(`m/48'`).privateExtendedKey)

    assert.throws(() => publicExt.deriveChild('coin\''),
      /Could not derive hardened child key/)

    // Private Key can extend even when hardened
    eq(privateExt.deriveChild('coin\''), correctCoin)
  })

  const eq = (child, pubkey) => {
    const childHex = child.publicKey.toString('hex')
    assert.equal(childHex, pubkey)
  }
})

describe('int path', () => {
  it('known ethereum address', () => {
    const seed = 'april twin common tattoo inch margin property quick law flush isolate topple'
    const passphrase = ''
    const hdkey = HDKey.fromMasterSeed(bip39.mnemonicToSeed(seed, passphrase))

    // tested with myetherwallet.com
    const path = `m/44'/60'/0'/0` // first address: m/44'/60'/0'/0/0
    const derivedEthAddresses = [
      '0x3151921FF0AAFB6617fC3A94942C10AA8CEf599E',
      '0x5E592ca3aE6484cCfc6a8E51CD03d3Be6FbB1682'
    ]

    const eq = (child, i) => {
      const publicEth = '0x' + pubToEthAddress(child.publicKey).toString('hex')
      assert.equal(publicEth.toLowerCase(), derivedEthAddresses[i].toLowerCase())
    }

    for(let i = 0; i < derivedEthAddresses.length; i++) {
      eq(hdkey.derive(`${path}/${i}`), i)
    }
  })

  /** @see https://github.com/ethereumjs/ethereumjs-util/blob/d03528e7da885539cad141c99ea5b88829f73e72/index.js#L287
  */
  const pubToEthAddress = pubKey => {
    pubKey = secp256k1.publicKeyConvert(pubKey, /*compress*/false).slice(1)
    assert(pubKey.length === 64)
    const sha3hash = createKeccakHash('keccak' + 256).update(pubKey).digest()
    return sha3hash.slice(-20) // lower 160bits
  }
})

