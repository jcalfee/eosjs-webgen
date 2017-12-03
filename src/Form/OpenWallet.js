import React, {PureComponent} from 'react';
import PropTypes from 'prop-types'

import NewWallet from './NewWallet'
import QrReaderDialog from '../QrReaderDialog'
import {randomMnemonic} from '../mnemonic'

import {confirmAlert} from 'react-confirm-alert'
import {suggest, validSeed, normalize} from 'bip39-checker'
import 'react-confirm-alert/src/react-confirm-alert.css'

import autofill from 'react-autofill'

require('./OpenWallet.css')

class OpenWallet extends PureComponent {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    newWallet: PropTypes.func.isRequired,
    cpuEntropyBits: PropTypes.number,
  }

  state = {showMnemonic: false, multiWallet: false}

  submit = (e) => {
    e.preventDefault()
    const {onSubmit, newWallet} = this.props
    const {newMnemonic} = this.state
    const mnemonic = normalize(this.refs.mnemonic.value)
    const multiWallet = this.refs.multiWallet.value

    const v = validSeed(mnemonic)
    if(v.valid) {
      if(newMnemonic) {
        newWallet(mnemonic, multiWallet)
      } else {
        onSubmit(mnemonic, /*isBip39*/true, multiWallet)
      }
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
        onSubmit(mnemonic, /*isBip39*/false)
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

  mnemonicChange = ({target: {value}}) => {
    this.setState({hasMnemonicChange: value !== ''})
  }

  reset = (e) => {
    this.setState({hasMnemonicChange: false, newMnemonic: null}, () => {
      this.refs.form.reset()
    })
  }

  newWallet = (e) => {
    this.reset()
    const {cpuEntropyBits} = this.props
    const newMnemonic = randomMnemonic(12, cpuEntropyBits)
    this.setState({newMnemonic})
  }

  render() {
    // const camera = <span role="img">&#x1f4f7;</span>  
    const eye = <span role="img">&#x1f441;</span>

    const {hasMnemonicChange, newMnemonic, showMnemonic} = this.state

    const disableEyeClass = showMnemonic ?  '' : 'DisabledEye'
    const mnemonicInputType = showMnemonic ? 'text' : 'password'

    const hasMnemonic = hasMnemonicChange || newMnemonic
    // label="Mnemonic Phrase"
    return (
      <div>
        <form onSubmit={this.submit} ref="form">
          <fieldset>
            <legend>Open Wallet</legend>
            <div className="ui container">
              <div className="ui fluid icon input">
                <input
                  required
                  ref="mnemonic"
                  type={mnemonicInputType}
                  defaultValue={newMnemonic}
                  onChange={this.mnemonicChange}
                />
                <div onClick={this.eye} id="OpenWallet_eye">
                  <i title="Show / Hide"
                    className={`${disableEyeClass} icon`}
                  >{eye}</i>
                </div>
              </div>
              <div>
                Private Mnemonic Phrase (Bip39,&nbsp;12+&nbsp;words)
              </div>
            </div>

            <div>
              <div className="ui column">
                <div>
                  <label for="multiWallet">
                    Prompt for passphrase (Multi-Wallet)
                    <input
                      type="checkbox"
                      id="multiWallet"
                      ref="multiWallet"
                    />
                  </label>
                </div>
              </div>
            </div>
            <br />

            <button className="ui button primary">Open</button>

            <QrReaderDialog scan={this.scan}
              title="Private Mnemonic Phrase Reader"
              message="Hold up your private mnemonic phrase QR code"
              component={click =>
                <button className="ui button primary" onClick={click}>QR</button>
              }/>

            {!hasMnemonic && <NewWallet newWallet={this.newWallet} />}
            {hasMnemonic && <button className="ui button primary" type="reset" onClick={this.reset}>Reset</button>}
            <br/>
            <br/>

          </fieldset>
        </form>
      </div>
    )
  }
}
export default autofill(OpenWallet)
