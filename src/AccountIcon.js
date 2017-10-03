import React from 'react';
import Identicon from './Identicon'

export default ({label = "Acct ", accountId}) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <Identicon hash={accountId} />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <p className="text-center">{label}{accountId}</p>
        </div>
      </div>
    </div>
  )
}