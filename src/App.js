import './App.css';
import './bootstrap.css';
import logo from './LogoData';

import React, { Component, PureComponent } from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

// import Formsy from 'formsy-react'
import { Form, Input } from 'formsy-react-components'
import autofill from 'react-autofill'

import QrReaderDialog from './QrReaderDialog'

import {EntropyContainer, EntropyCount} from './Entropy'

import createHistory from 'history/createBrowserHistory'

import QRCode from 'react-qr';
import {PrivateKey, key_utils} from 'eosjs-ecc';
import Identicon from './Identicon'

import {randomMnemonic, mnemonicKeyPair, mnemonicIv} from './mnemonic'
import {suggest, validSeed, normalize} from 'bip39-checker'

import ReactConfirmAlert, {confirmAlert} from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

const history = createHistory()
let cpuEntropyBits

export default class App extends Component {

  static initialState = {}

  constructor() {
    super()
    this.state = App.initialState
  }

  componentWillMount() {
    // cpuEntropyBits = 0 // fast weeker key (for development only) 
    // this.newWallet() // short-cuts for development only
    // this.onSubmitPassword({password: '', hint: ''}) // dev only
  }

  componentDidMount() {
    history.listen((location, action) => {
      // console.log(action, location.pathname, location.state)
      if(action === 'POP') {
        if(this.state.accountId) {
          this.setState({
            wif: null,
            pubkey: null,
            accountId: null,
            hint: null
          })
        } else if(this.state.mnemonic) {
          this.state = App.initialState
          this.setState()
        }
      }
    })
  }

  newWallet = (mnemonic) => {
    const mnemonicId = mnemonicIv(mnemonic, "mnemonicId").readUInt16LE(0)
    this.setState({ mnemonic, mnemonicId, isBip39: true }, () => {
      history.push()
    })
  }

  openWallet = (mnemonic, isBip39, newMnemonic) => {
    const mnemonicId = mnemonicIv(mnemonic, "mnemonicId").readUInt16LE(0)
    this.setState({ mnemonic, mnemonicId, isBip39, newMnemonic }, () => {
      // console.log('newMnemonic', newMnemonic)
      history.push()
    })
  }

  loginWallet = ({mnemonic, accountId}) => {
    this.setState({ mnemonic, accountId}, () => {
      history.push()
    })
  }

  onSubmitPassword = ({password, hint}) => {
    const {mnemonic} = this.state
    const {wif, pubkey, iv} = mnemonicKeyPair(mnemonic, password)
    const accountId = iv.readUInt16LE(0)
    this.setState({wif, pubkey, accountId, hint}, () => {
      history.push()
    })
  }

  render() {
    const {mnemonic, mnemonicId, isBip39} = this.state
    const {wif, pubkey, hint, accountId} = this.state

    return (
      <EntropyContainer>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h3>Wallet Key Tool</h3>
          </div>
          <br />

          {!mnemonic &&
          <div className="App-intro">
            <div className="container">
              <div className="row">
                <div className="col border border-info rounded">
                  <OpenWalletForm onSubmit={this.openWallet}
                    newWallet={this.newWallet} />
                </div>
              </div>
              {/*<div className="row">
                <div className="col border border-info rounded">
                  <PasswordAccountLogin onSubmit={this.loginWallet} />
                </div>
              </div>*/}
            </div>
          </div>}

          <div className="App-body">
            {mnemonic && <div>
              <MnemonicKeyCard {...{mnemonic, mnemonicId, isBip39}}/>
              <br />
              <br />
            </div>}

            {mnemonic && !wif && <div>
              <EnterPasswordForm {...{mnemonicId}} 
                onSubmit={this.onSubmitPassword}/>
            </div>}

            {wif && <div>
              <PrivateKeyCard {...{wif, pubkey, hint, accountId}}/>
              <br />
              <br />
              <PublicKeyCard {...{pubkey, hint}} />
            </div>}
          </div>
        </div>
      </EntropyContainer>
    )
  }
}

require('./OpenWallet.css')
OpenWalletForm = autofill(OpenWalletForm)
class OpenWalletForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    newWallet: PropTypes.func.isRequired,
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
    const newMnemonic = randomMnemonic(12, cpuEntropyBits)
    this.setState({newMnemonic})
  }

  formRef = r => this.form = r

  render() {
    const camera = <span>&#x1f4f7;</span>  
    const eye = <span>&#x1f441;</span>
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

class NewWallet extends PureComponent {
  static propTypes = {
    newWallet: PropTypes.func.isRequired
  }

  constructor() {
    super()
    this.state = {}
  }

  newWallet = () => {
    const waitForRenderMs = 100
    this.setState(
      {generating: true},
      () => {setTimeout(() => {go()}, waitForRenderMs)}
    )
    const go = () => {
      this.props.newWallet()
      this.setState({generating: false})
    }
  }

  render() {
    const {generating} = this.state
    if(generating) {
      return (
        <span>Creating&hellip;</span>
      )
    }

    return (
      // div instead of a button, prevent the password manager from saving an old phrase (being over-written)
      <div className="btn btn-primary" onClick={this.newWallet}>
        New Phrase <small>(entropy {<EntropyCount/>}&hellip;)</small>
      </div>
    )
  }
}
// {generating && <div className="App-intro">
//   <h3>Creating Mnemonic Phrase</h3>
//   <br/>
//   Gathering entropy&hellip;
// </div>}

const MnemonicKeyCard = ({mnemonic, mnemonicId, isBip39}) => (
  <fieldset>
    {!isBip39 && <div>
      <h3>
        <p className="text-center text-warning text-dark">
          <b>Warning: Unchecked Mnemonic Phrase</b>
        </p>
      </h3>
    </div>}

    <div className="row">
      <div className="col">
        <fieldset>
          <legend style={{whiteSpace: 'nowrap'}}>Private Mnemonic Phrase</legend>
          <QRCode text={mnemonic}/>
          <br />
          <small>[{isBip39 ? 'Bip39' : 'Unchecked'}] Starts With: {mnemonic.split(' ').slice(0, 3).join(' ')} &hellip;</small>
        </fieldset>
      </div>
      <div className="col-8">
        <div style={{float: 'right'}}>
          <AccountIcon label="Mn " accountId={mnemonicId} />
        </div>
        <fieldset>
          <legend>Private Mnemonic Phrase <small>({isBip39 ? 'Bip39' : 'Unchecked'})</small></legend>
          <SpanSelect className="CopyText">{mnemonic}</SpanSelect>
          <br />&nbsp;
          <ul>
            <li>You are the only person with this phrase, no phrase no funds</li>
            <li>Carefully write down all words in order</li>
            <li>Securely print or photograph this page</li>
            <li>If saving on a USB or Removable drive, safely eject</li>
            <li>Your funds could be stolen if you use your mnemonic key on a malicious/phishing site</li>
          </ul>
        </fieldset>
      </div>
    </div>
  </fieldset>
)

class EnterPasswordForm extends React.Component {
  componentDidMount() {
    this.passwordRef.element.focus()
  }

  submit = ({password, hint = 'empty'}) => {
    // https://github.com/christianalfoni/formsy-react/issues/484
    const passValue = this.passwordRef.element.value
    this.props.onSubmit({password: passValue, hint})
  }

  render() {
    const {mnemonicId} = this.props
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
// <li>Write down your Passphrase Account ID: <u>{accountId}</u></li>
// <li>Write down your Passphrase Hint: <u>{hint}</u></li>


const PasswordAccountLogin = ({accountId, hint, onSubmit}) => (
  <fieldset>
    <legend>Passphrase Account</legend>
    <div style={{float: 'right'}}>
      <AccountIcon accountId={accountId} />
    </div>

    <p>
      The Passphrase Account ID is optional but may assist with form
      auto-completion and will check your passphrase in the next step.
    </p>

    <Form onValidSubmit={onSubmit}>
      <Input type="text" name="accountId" autoComplete="yes"
        placeholder="Passphrase Account ID (optional)" />

      <Input type="password" name="Mnemonic Phrase" required autoComplete="yes"
        placeholder="Mnemonic Phrase (12+ words)" />
    </Form>

    <ul>
      {hint && <li>Passphrase Hint: <u>{hint}</u></li>}
      <li>Passphrase Account ID: <u>{accountId}</u></li>
    </ul>
  </fieldset>
)

const AccountIcon = ({label = "Acct ", accountId}) => {
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

const PrivateKeyCard = ({wif, pubkey, hint, accountId}) => (
  <div>
    <div className="row">
      <div className="col-4">
        <fieldset>
          <legend>Private Key</legend>
          <QRCode text={wif}/>
          <br />
          <small><b>Wallet Import Format &mdash; WIF</b></small>
          <br />
          <small>Corresponds to: {pubkey.substring(0, 7)}&hellip;</small>
        </fieldset>
      </div>
      <div className="col">
        <div style={{float: 'right'}}>
          <AccountIcon accountId={accountId} />
        </div>
        <fieldset>
          <legend>Private Key <small>(Wallet Import Format &mdash; WIF)</small></legend>
          <SpanSelect className="CopyText">{wif}</SpanSelect>
        </fieldset>
        <br/>
        <ul>
          <li>Passphrase Hint: <u>{hint}</u></li>
          <li>Account ID: <u>{accountId}</u></li>
          <li>Your funds will be stolen if you use your private key on a malicious/phishing site.</li>
          <li><small>Corresponding Public Key: {pubkey}</small></li>
        </ul>
      </div>
    </div>
  </div>
)
// <li>The same private key appers in two formats above.</li>

const PublicKeyCard = ({pubkey, hint}) => (
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

const selectAll = e => {
  const element = e.target
  // console.log('e', e); e.persist()
  const selection = window.getSelection()
  const range = document.createRange()
  
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
  
  // document.execCommand('copy') // 
}

const SpanSelect = ({children, ...childProps}) => {
  return <span onClick={selectAll} {...childProps}>{children}</span>
}
