import React from 'react';
import PropTypes from 'prop-types';
// import { Form, Input } from 'formsy-react-components'
// import {Form} from 'formsy-react'
// import Input from './Input'

export default class EnterPasswordForm extends React.Component {
  static propTypes = {
    autoComplete: PropTypes.bool.isRequired
  }

  static defaultProps = {
    autoComplete: false
  }

  componentDidMount() {
    this.refs.passphrase.focus()
  }

  submit = (e) => {
    e.preventDefault()
    const {password, hint} = e.target
    this.props.onSubmit({
      password: password.value,
      hint: hint.value
    })
  }

  render() {
    const {autoComplete} = this.props
    return (
      <fieldset>
        <legend>Passphrase (multi-wallet support)</legend>

        Enter a short passphrase that will be easy to remember.  This is not the 
        same as a typical password (see points below).
        <br />
        <br />

        <form onSubmit={this.submit}>
          <h3>Passphrase (optional)</h3>
          <br />

          {!autoComplete && <div>
            {/* https://stackoverflow.com/questions/12374442/chrome-browser-ignoring-autocomplete-off */}
            <input style={{display:'none'}}/>
            <input type="password" style={{display:'none'}}/>
          </div>}

          <label for="passphrase">
            Passphrase
            <input id="passphrase" type="password" ref="passphrase"
              placeholder="Passphrase" autoComplete="off"
            />
          </label>

          <label for="confirm">
            Confirm
            <input id="confirm" type="password" ref="confirm"
              autoComplete="off" placeholder="Confirm"
            />
          </label>

          <ul>
            <li>This passphrase can be short and easy</li>
            <li>Every passphrase creates a different wallet</li>
            <li>Every passphrase is valid (including no passphrase)</li>
            <li>This passphrase acts like an additional word added the Mnemonic Phrase</li>
            <li>Consider a passphrase you can share with those you trust</li>
            <li>No passphrase, no private key, no funds</li>
            <li>Passphrase is case sensitive</li>
          </ul>
          <br />

          <h3> Hint (recommended)</h3>
          This will appear on your backup.  The passphrase is very important,
          this hint is recommended.
          <br />
          <br />

          <label for="hint">
            Passphrase Hint
            <input id="hint" placeholder="Hint" ref="hint"/>
          </label>
          <br />

          <button className="ui button primary" type="submit">Submit</button>
        </form>
      </fieldset>
    )
  }
}
// <li>Secure this information as if it were worth your weight in gold</li>
