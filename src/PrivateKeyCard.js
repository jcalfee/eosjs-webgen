import React from 'react';
import QRCode from 'react-qr';

import AccountIcon from './AccountIcon'
import SpanSelect from './SpanSelect'

export default ({wif, pubkey, hint, accountId}) => (
  <div>
    <div className="row">
      <div className="col-4">
        <fieldset>
          <legend>Private Key</legend>
          <QRCode text={wif}/>
          <br />
          <small><b>Wallet Import Format &mdash; WIF</b></small>
          <br />
          <small>Corresponds to: {pubkey.substring(0, 7)}&hellip;</small>
        </fieldset>
      </div>
      <div className="col">
        <div style={{float: 'right'}}>
          <AccountIcon accountId={accountId} />
        </div>
        <fieldset>
          <legend>Private Key <small>(Wallet Import Format &mdash; WIF)</small></legend>
          <SpanSelect className="CopyText">{wif}</SpanSelect>
        </fieldset>
        <br/>
        <ul>
          <li>Passphrase Hint: <u>{hint}</u></li>
          <li>Account ID: <u>{accountId}</u></li>
          <li>Your funds will be stolen if you use your private key on a malicious/phishing site.</li>
          <li><small>Corresponding Public Key: {pubkey}</small></li>
        </ul>
      </div>
    </div>
  </div>
)