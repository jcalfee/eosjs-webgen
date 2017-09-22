const {bip39} = require('bip39-checker')
const {key_utils} = require('eosjs-ecc')

module.exports = {

  /**
    @arg {number} wordCount - commonly: 12, 18, or 24
    @arg {number} [cpuEntropyBits = bits(wordCount)] - 0 for quick testing
  */
  randomMnemonic: (wordCount = 24, cpuEntropyBits) => {
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
}
