import React, {PureComponent} from 'react';
import PropTypes from 'prop-types'

import NewWallet from './NewWallet'
import QrReaderDialog from '../QrReaderDialog'
import {randomMnemonic} from '../mnemonic'

import {suggest, validSeed, normalize} from 'bip39-checker'
import {confirmAlert} from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

// import Formsy from 'formsy-react'
import { Form, Input } from 'formsy-react-components'

import autofill from 'react-autofill'

require('./OpenWallet.css')

class OpenWallet extends PureComponent {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    newWallet: PropTypes.func.isRequired,
    cpuEntropyBits: PropTypes.number,
  }

  state = {showMnemonic: false}

  submit = ({mnemonic}) => {
    const {onSubmit} = this.props
    const {newMnemonic} = this.state

    mnemonic = normalize(mnemonic)
    const v = validSeed(mnemonic)
    if(v.valid) {
      onSubmit(mnemonic, true, newMnemonic)
      return
    }

    let word, suggestions, wordIndex = 0
    mnemonic.split(' ').find(el => {
      wordIndex++
      const res = suggest(el, {maxSuggestions: 5})
      if(res !== true) {
        word = el
        if(res.length) {
          suggestions = res.join(', ')
        }
        return true
      }
      return false
    })

    confirmAlert({
      title: 'Bad Phrase',
      cancelLabel: 'Cancel',
      confirmLabel: 'Continue Anyway',
      message: `Error: ${v.error}`,
      childrenElement: () => (<div>
        {word ? <div>Invalid word #{wordIndex}: {word}<br/></div> : ''}
        {suggestions ? <div>Suggestions: {suggestions}<br/></div> : ''}
      </div>),
      onConfirm: () => {
        onSubmit(mnemonic, false, newMnemonic)
      }
    })
  }

  /**
    Convert the mnemonic input to / from a password field.
  */
  eye = () => {
    this.setState({showMnemonic: !this.state.showMnemonic})
  }

  scan = mnemonic => this.submit({mnemonic})

  mnemonicChange = (name, value) => {
    this.setState({hasMnemonicChange: value !== '', newMnemonic: value})
  }

  reset = (e) => {
    this.form.formsyForm.reset()
    this.setState({hasMnemonicChange: false, newMnemonic: null})
  }

  newWallet = () => {
    this.reset()
    const {cpuEntropyBits} = this.props
    const newMnemonic = randomMnemonic(12, cpuEntropyBits)
    this.setState({newMnemonic})
  }

  formRef = r => this.form = r

  render() {
    const camera = <span role="img">&#x1f4f7;</span>  
    const eye = <span role="img">&#x1f441;</span>

    const {hasMnemonicChange, newMnemonic, showMnemonic} = this.state

    const disableEyeClass = showMnemonic ?  '' : 'DisabledEye'
    const mnemonicInputType = showMnemonic ? 'text' : 'password'

    const hasMnemonic = hasMnemonicChange || newMnemonic
    return (
      <div>
        <Form onValidSubmit={this.submit} ref={this.formRef}>
          <fieldset>
            <legend>Open Wallet</legend>
            <div className="row">
              <div className="col">
                <Input required type={mnemonicInputType}
                  name="mnemonic" label="Mnemonic Phrase"
                  help="Private Mnemonic Phrase (Bip39,&nbsp;12&nbsp;words)"
                  value={newMnemonic}
                  onChange={this.mnemonicChange}
                  elementWrapperClassName="mnemonic-component"
                  addonAfter={
                    <span id="OpenWallet_eye" title="Show / Hide"
                      className={disableEyeClass}
                      onClick={this.eye}>{eye}</span>
                  }
                />
              </div>
              <div className="col-1">
                &nbsp;
              </div>
            </div>
            <br />

            <button className="btn btn-primary">Open</button>

            <QrReaderDialog scan={this.scan}
              title="Private Mnemonic Phrase Reader"
              message="Hold up your private mnemonic phrase QR code"
              component={click =>
                <button className="btn btn-primary" onClick={click}>QR ({camera})</button>
              }/>

            {!hasMnemonic && <NewWallet newWallet={this.newWallet} />}
            {hasMnemonic && <button className="btn btn-primary" type="reset" onClick={this.reset}>Reset</button>}
            <br/>
            <br/>

          </fieldset>
        </Form>
      </div>
    )
  }
}

export default autofill(OpenWallet)
