import React from 'react';
import { Form, Input } from 'formsy-react-components'

export default class EnterPasswordForm extends React.Component {
  componentDidMount() {
    this.passwordRef.element.focus()
  }

  submit = ({password, hint = 'empty'}) => {
    // https://github.com/christianalfoni/formsy-react/issues/484
    const passValue = this.passwordRef.element.value
    this.props.onSubmit({password: passValue, hint})
  }

  render() {
    return (
      <fieldset>
        <legend>Create Passphrase</legend>

        Create a short passphrase that will be easy to remember.  This is not the 
        same as a typical password (see points below).
        <br />
        <br />

        <Form onValidSubmit={this.submit}>
          <h3>Passphrase (optional)</h3>
          <br />

          {/* https://stackoverflow.com/questions/12374442/chrome-browser-ignoring-autocomplete-off */}
          <input style={{display:'none'}}/>
          <input type="password" style={{display:'none'}}/>

          <Input type="password" name="password" id="password"
            label="Passphrase" autoComplete="off" placeholder="Password"
            componentRef={component => {this.passwordRef = component}}
          />

          {/* https://github.com/christianalfoni/formsy-react/issues/484
          <Input
            type="password" name="confirm" label="Confirm"
            autoComplete="off" placeholder="Confirm"
            validations="equalsField:password"
            validationErrors={{equalsField: 'Passwords must match.'}}
          />*/}

          <ul>
            <li>Every passphrase creates a different wallet</li>
            <li>Every passphrase is valid (including no passphrase)</li>
            <li>This passphrase acts like an additional word added the Mnemonic Key</li>
            <li>Consider a passphrase you can share with those you trust</li>
            <li>No passphrase, no private key, no funds</li>
            <li>Password is case sensitive</li>
          </ul>
          <br />

          <h3> Hint (recommended)</h3>
          This will appear on your backup.  The passphrase is very important,
          this hint is recommended.
          <br />
          <br />

          <Input name="hint" label="Passphrase Hint" placeholder="Hint" />
          <br />

          <input className="btn btn-primary" type="submit" defaultValue="Submit" />
        </Form>
      </fieldset>
    )
  }
}
// <li>Secure this information as if it were worth your weight in gold</li>
