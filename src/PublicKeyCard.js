import React from 'react';
import QRCode from 'react-qr';

import AccountIcon from './AccountIcon'
import SpanSelect from './SpanSelect'

export default ({pubkey, path, hint = 'empty', accountId}) => (
  <div>
    <div className="row">
      <div className="col-3">
        <fieldset>
          <legend>Public Key</legend>
          <QRCode text={pubkey}/>
          <br />
          <small>Public Key {pubkey.substring(0, 7)}&hellip;</small>
        </fieldset>
      </div>
      <div className="col">
        <fieldset>
          <legend>Public Key</legend>
          <SpanSelect className="CopyPublicText">{pubkey}</SpanSelect>
          <div style={{float: 'right'}}>
            <AccountIcon accountId={accountId} />
          </div>
          <ul>
            <li>Passphrase Hint: <u>{hint}</u></li>
            {path && <li>Key dervidation path: <u>{path}</u></li>}
            <li>Give out this public key to receive payments.</li>
            <li>You may use this <b>Public Key</b> as your <b>EOS claim key</b>.</li>
          </ul>
        </fieldset>
      </div>
    </div>
  </div>
)