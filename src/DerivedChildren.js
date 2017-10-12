import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import SpanSelect from './SpanSelect'
import PrivateKeyCard from './PrivateKeyCard'
import PublicKeyCard from './PublicKeyCard'

export default class DerivedChildren extends PureComponent {
  static PropTypes = {
    children: PropTypes.array.isRequired,
    hint: PropTypes.string
  }

  static defaultProps = {
    hint: 'empty'
  }

  state = {}

  show = key => {
    const pubkey = this.state.pubkey === key ? null : key // toggle
    this.setState({pubkey})
  }

  render() {
    const {children, hint} = this.props
    const {pubkey} = this.state

    const keys = children
      .filter(child => pubkey && child.pubkey === pubkey)
      .map(child => {
        const {wif, pubkey, pubkeyBuffer, path} = child
        const accountId = pubkeyBuffer.readUInt16LE(0)
        return {wif, pubkey, accountId, path}
      })

    const showing = keys.length > 0
    const keyMenu = showing ? keys : children
    const label = showing ? 'hide' : 'show'

    return (
      <div>
        <h3>Warning: beta key dervidation, this will change</h3>
        <div className="row">
          <div className="col">Path</div>
          <div className="col">Public Key</div>
          <div className="col-1" title="Show private key">Private&nbsp;Key</div>
        </div>
        {keyMenu.map(child => (
          <div className="row">
            <div className="col">{child.path}</div>
            <div className="col"><SpanSelect className="CopyPublicText">{child.pubkey}</SpanSelect></div>
            <div className="col-1">
              <a onClick={() => this.show(child.pubkey)} className="badge badge-warning">{label}</a>
            </div>
          </div>
        ))}
        {keys.map(({wif, pubkey, accountId, path}) => (
          <div>
            <hr />
            <PublicKeyCard {...{pubkey, hint, path, accountId}} />
            <br />
            <br />
            <hr />
            <PrivateKeyCard {...{wif, pubkey, hint, path, accountId}}/>
          </div>
        ))}
      </div>
    )
  }
}