import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

export default class BackupConfirm extends PureComponent {
  static PropTypes = {
    onClick: PropTypes.func.isRequired
  }

  state = {}

  confirm1 = ()=> {
    this.setState({confirm1: !this.state.confirm1})
  }

  confirm2 = ()=> {
    this.setState({confirm2: !this.state.confirm2})
  }

  backup = ()=> {
    this.props.onClick()
  }

  render() {
    const {confirm1, confirm2} = this.state
    const disabled = !(confirm1 && confirm2)
    return (
      <div>
        <label>
          <input type="checkbox" onClick={this.confirm1} />&nbsp;
          I understand that a lost Private Mnemonic Phrase cannot recoverd
        </label>
        <br />
        <label>
          <input type="checkbox" onClick={this.confirm2} />&nbsp;
          I have securely saved my generated Private Mnemonic Phrase
        </label>
        <br />
        <br />
        <button className="btn btn-primary"
          onClick={this.backup} {...{disabled}}>
          I have made a backup
        </button>
      </div>
    )
  }
}