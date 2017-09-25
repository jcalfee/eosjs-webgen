import './App.css';
import './bootstrap.css';
import logo from './LogoData';

import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types'

import { Form, Input, Textarea } from 'formsy-react-components'

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
    cpuEntropyBits = 0 // fast weeker key (for development only) 
    // this.newWallet() // short-cuts for development only
    // this.onSubmitPassword({password: '', hint: ''}) // dev only
  }

  componentDidMount() {
    history.listen((location, action) => {
      // console.log(action, location.pathname, location.state)
      if(action === 'POP') {
        if(this.state.mnemonic) {
          this.state = App.initialState
          this.setState()
        }
      }
    })
  }

  newWallet = (done) => {
    const mnemonic = randomMnemonic(24, cpuEntropyBits)
    this.setState({ mnemonic, isBip39: true }, () => {
      history.push()
    })
  }

  openWallet = (mnemonic, isBip39) => {
    this.setState({ mnemonic, isBip39 }, () => {
      history.push()
    })
  }

  loginWallet = ({mnemonic, accountId}) => {
    this.setState({ mnemonic, accountId }, () => {
      history.push()
    })
  }

  onSubmitPassword = ({password, hint}) => {
    const {mnemonic} = this.state
    const {wif, pubkey, accountId} = mnemonicKeyPair(mnemonic, password)
    this.setState({wif, pubkey, accountId, hint})
  }

  render() {
    const {mnemonic, isBip39} = this.state
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
                  <OpenWalletForm onSubmit={this.openWallet} newWallet={this.newWallet} />
                </div>
              </div>
              {/*<div className="row">
                <div className="col border border-info rounded">
                  <PasswordAccountLogin onSubmit={this.loginWallet} />
                </div>
              </div>*/}
            </div>
          </div>}

          {mnemonic && <div className="App-body">
            <MnemonicKeyCard {...{mnemonic, isBip39}}/>
            <br />
            <br />
          </div>}
        </div>
      </EntropyContainer>
    )
  }
}
// <EnterPasswordForm onSubmit={this.onSubmitPassword}/>
// <PrivateKeyCard {...{wif, pubkey, hint, accountId}}/>
// <PublicKeyCard {...{pubkey, hint}} />

require('./OpenWallet.css')
class OpenWalletForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    newWallet: PropTypes.func.isRequired,
  }

  submit = ({mnemonic}) => {
    const {onSubmit} = this.props

    mnemonic = normalize(mnemonic)
    const v = validSeed(mnemonic)
    if(v.valid) {
      onSubmit(mnemonic, true)
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
        onSubmit(mnemonic, false)
      }
    })
  }

  /**
    Convert the mnemonic input to / from a password field.
  */
  eye = () => {
    const mnEl = document.getElementById("openWalletMnemonic")
    const hide = mnEl.type !== 'password' // Toggle
    mnEl.setAttribute('type', hide ? 'password' : 'text')

    const eyeEl = document.getElementById("OpenWallet_eye")
    eyeEl.setAttribute('class', hide ? 'DisabledEye' : '')
  }

  scan = mnemonic => this.submit({mnemonic})

  render() {
    const camera = <span>&#x1f4f7;</span>  
    const eye = <span>&#x1f441;</span>
    const {newWallet} = this.props

    return (
      <div>
        <Form onValidSubmit={this.submit} >
          <fieldset>
            <legend>Open Wallet</legend>
            <div className="row">
              <div className="col">
                <Input required type="password" id="openWalletMnemonic"
                  name="mnemonic" label="Mnemonic Phrase"
                  help="Private Mnemonic Phrase (Bip39,&nbsp;24&nbsp;words)"
                  addonAfter={
                    <span id="OpenWallet_eye" title="Show / Hide"
                      className="DisabledEye"
                      onClick={this.eye}>{eye}</span>
                  }
                />
              </div>
              <div className="col-2">
                &nbsp;
              </div>
            </div>
            <br />

            <button>Open</button>

            <QrReaderDialog scan={this.scan}
              title="Private Mnemonic Phrase Reader"
              message="Hold up your private mnemonic phrase QR code"
              component={click =>
                <button onClick={click}>QR ({camera})</button>
              }/>

            <NewWallet newWallet={newWallet} />

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
      this.props.newWallet(() => {
        this.setState({generating: false})
      })
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
      <button onClick={this.newWallet}>
        New Wallet <small>(entropy {<EntropyCount/>}&hellip;)</small>
      </button>
    )
  }
}
// {generating && <div className="App-intro">
//   <h3>Creating Mnemonic Phrase</h3>
//   <br/>
//   Gathering entropy&hellip;
// </div>}

const MnemonicKeyCard = ({mnemonic, isBip39}) => (
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
        <fieldset>
          <legend>Private Mnemonic Phrase <small>({isBip39 ? 'Bip39' : 'Unchecked'})</small></legend>

          <div style={{float: 'right'}}>
            <MnemonicIcon mnemonic={mnemonic} />
          </div>
          <SpanSelect className="CopyText">{mnemonic}</SpanSelect>
          <br />&nbsp;
          <ul>
            <li>You are the only person with this phrase, no phrase no funds</li>
            <li>Carefully write down all 24 words in order</li>
            <li>Securely print or photograph this page</li>
            <li>If saving on a USB or Removable drive, safely eject and re-open</li>
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
    // this.passwordRef.element.getDOMNode().value = 'hi'
  }

  submit = ({password, hint = 'empty'}) =>
    this.props.onSubmit({password, hint})

  render = () => (
    <fieldset>
      <legend>Create Passphrase</legend>

      Create a short passphrase that will be easy to remember.  This is not the 
      same as a typical password (see points below).
      <br />
      <br />

      <Form onValidSubmit={this.submit}>
        <fieldset>
          <legend>Passphrase (optional)</legend>
          <br />
          <Input
            type="password" name="password" label="Passphrase"
            value="" autoComplete="off"
            placeholder="Password"
            componentRef={component => {
              this.passwordRef = component
            }}
          />

          <Input
            type="password" name="confirm" label="Confirm"
            value="" autoComplete="off"
            placeholder="Confirm"
            validations="equalsField:password"
            validationErrors={{
              equalsField: 'Passwords must match.'
            }}
          />

          <ul>
            <li>Every passphrase creates a different wallet</li>
            <li>Every passphrase is valid (including no passphrase)</li>
            <li>This passphrase acts like an additional word added the Mnemonic Key</li>
            <li>Consider a passphrase you can share with those you trust</li>
            <li>No passphrase, no private key, no funds</li>
            <li>Password is case sensitive</li>
          </ul>
        </fieldset>
        <br />

        <fieldset>
          <legend> Hint (recommended)</legend>
          This will appear on your backup.  The passphrase is very important,
          this hint is recommended.
          <br />
          <br />

          <Input name="hint" label="Passphrase Hint" />
        </fieldset>
        <br />

        <input
          className="btn btn-primary"
          type="submit" defaultValue="Submit"
        />
      </Form>
    </fieldset>
  )
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
        placeholder="Mnemonic Phrase (24 words)" />
    </Form>

    <ul>
      {hint && <li>Passphrase Hint: <u>{hint}</u></li>}
      <li>Passphrase Account ID: <u>{accountId}</u></li>
    </ul>
  </fieldset>
)


class MnemonicIcon extends PureComponent {
  render() {
    const {mnemonic} = this.props
    const mnemonicId = mnemonicIv(mnemonic, "mnemonicId").readUInt16LE(0)
    return <AccountIcon label="Mnemonic " accountId={mnemonicId} />
  }
}

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
  <fieldset>
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
  </fieldset>
)
// <li>The same private key appers in two formats above.</li>

const PublicKeyCard = ({pubkey, hint}) => (
  <fieldset>
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
  </fieldset>
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
