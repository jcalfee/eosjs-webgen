import React from 'react';
import QRCode from 'react-qr';

import SpanSelect from './SpanSelect'

export default ({pubkey, hint}) => (
  <div>
    <div className="row">
      <div className="col-4">
        <fieldset>
          <legend>Public Key</legend>
          <QRCode text={pubkey}/>
          <br />
          <small>Public Key {pubkey.substring(0, 7)}&hellip;</small>
        </fieldset>
      </div>
      <div className="col">
        <fieldset>
          <legend>EOS Public Key</legend>
          <SpanSelect className="CopyText">{pubkey}</SpanSelect>
          <ul>
            <li>Passphrase Hint: "<u>{hint}</u>"</li>
            <li>Give out this public key to receive payments.</li>
            <li>You may use this <b>Public Key</b> as your <b>EOS claim key</b>.</li>
          </ul>
        </fieldset>
      </div>
    </div>
  </div>
)