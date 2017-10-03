import React, {PureComponent} from 'react';

import {key_utils} from 'eosjs-ecc'

let entropyCount = 0

export const EntropyCount = () => (
  <span id="entropyCount" />
)

export class EntropyContainer extends PureComponent {
  entropyListener = e => {
    if(e.type === 'mousemove') {
      key_utils.addEntropy(e.pageX, e.pageY, e.screenX, e.screenY)
    } else {
      console.log('onEntropyEvent Unknown', e.type, e)
    }
    entropyCount++
    const entropyCountEl = document.getElementById('entropyCount')
    if(entropyCountEl) {
      entropyCountEl.innerHTML = entropyCount
    }
  }

  render = () => (
    <span onMouseMove={this.entropyListener}>{this.props.children}</span>
  )
}

