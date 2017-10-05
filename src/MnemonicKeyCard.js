import React from 'react';
import QRCode from 'react-qr';

import AccountIcon from './AccountIcon'
import SpanSelect from './SpanSelect'

export default ({mnemonic, mnemonicId, isBip39}) => (
  <fieldset>
    {!isBip39 && <div>
      <h3>
        <p className="text-center text-warning text-dark">
          <b>Warning: Unchecked Mnemonic Phrase</b>
        </p>
      </h3>
    </div>}

    <div className="row">
      <div className="col">
        <fieldset>
          <legend style={{whiteSpace: 'nowrap'}}>Private Mnemonic Phrase</legend>
          <QRCode text={mnemonic}/>
          <br />
          <small>[{isBip39 ? 'Bip39' : 'Unchecked'}] Starts With: {mnemonic.split(' ').slice(0, 3).join(' ')} &hellip;</small>
        </fieldset>
      </div>
      <div className="col-8">
        <div style={{float: 'right'}}>
          <AccountIcon label="Mn " accountId={mnemonicId} />
        </div>
        <fieldset>
          <legend>Private Mnemonic Phrase <small>({isBip39 ? 'Bip39' : 'Unchecked'})</small></legend>
          <SpanSelect className="CopyText">{mnemonic}</SpanSelect>
          <br />&nbsp;
          <ul>
            <li>You are the only person with this phrase, no phrase no funds</li>
            <li>Carefully write down all words in order</li>
            <li>Securely print or photograph this page</li>
            <li>If saving on a USB or Removable drive, safely eject</li>
            <li>Your funds could be stolen if you use your mnemonic phrase on a malicious/phishing site</li>
          </ul>
        </fieldset>
      </div>
    </div>
  </fieldset>
)