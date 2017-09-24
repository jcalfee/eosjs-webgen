const bip39 = require('bip39')
const {key_utils, PrivateKey} = require('eosjs-ecc')

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

export function mnemonicKeyPair(mnemonic, password) {
  const I = bip39.mnemonicToSeed(mnemonic, password)
  const IL = I.slice(0, 32)
  const IR = I.slice(32)

  const privateKey = PrivateKey.fromBuffer(IL)
  const wif = privateKey.toString()
  const pubkey = privateKey.toPublic().toString()
  const iv = IR.readUInt16LE(0)

  return {wif, pubkey, iv}
}

/** @return {Buffer} Initialization vector. This is generally not
  considered private.
*/
export function mnemonicIv(mnemonic, password) {
  const I = bip39.mnemonicToSeed(mnemonic, password)
  const IR = I.slice(32)
  return IR
}