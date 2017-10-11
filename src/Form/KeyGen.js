import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Form, Input, RadioGroup, CheckboxGroup} from 'formsy-react-components'

export default class KeyGen extends PureComponent {
  static PropTypes = {
    onSubmit: PropTypes.func.isRequired,
    seed: PropTypes.func.isRequired
  }

  state = {}

  submit = ({keyType, account, roles}) => {
    const {seed, onSubmit} = this.props
    const children = []
    if(keyType === 'claimkey') {
      children.push(seed('eos/eos/claimkey'))
    } else {
      account = account.toLowerCase().trim()
      roles.forEach(role => {
        children.push(seed('eos/' + account + '/' + role))
      })
    }
    onSubmit(children)
  }

  keyType = (name, keyType) => {
    this.setState({keyType})
  }

  static keyTypes = [
    {value: 'claimkey', label: 'Claim Key'},
    {value: 'rolekey', label: 'Role based keys'}
  ]

  static roles = [
    {value: 'owner', label: 'Owner'},
    {value: 'active', label: 'Active'},
    {value: 'recovery', label: 'Recovery'},
  ]

  render() {
    const {keyType} = this.state

    return (
      <fieldset>
        <legend>Derive Key</legend>

        Create keys from your mnemonic phrase.
        <br />
        <br />

        <Form onValidSubmit={this.submit}>
          <RadioGroup
            name="keyType"
            label="Key Type"
            help="Select your key type."
            options={KeyGen.keyTypes}
            onChange={this.keyType}
            required
          />

          {keyType === 'rolekey' && <div>
            <Input type="text" name="account" label="Account" required  
              componentRef={component => {component && component.element.focus()}}
              placeholder="Account Name"
            />
            <CheckboxGroup
              name="roles" label="Roles"
              help="Select each role needing a key."
              options={KeyGen.roles}
              required
            />
          </div>}

          <br />
          <input className="btn btn-primary" type="submit" defaultValue="Submit" />
        </Form>
      </fieldset>
    )
  }
}
// <li>Secure this information as if it were worth your weight in gold</li>
