import './App.css';
import './bootstrap.css';
import logo from './LogoData';

import React, { Component } from 'react';

import { Form, Input, Textarea } from 'formsy-react-components'

import createHistory from 'history/createBrowserHistory'

import QRCode from 'react-qr';
import {PrivateKey, key_utils} from 'eosjs-ecc';
import Identicon from './Identicon'

import {randomMnemonic} from './mnemonic'
import {suggest, validSeed, normalize, bip39} from 'bip39-checker'
import {confirmAlert} from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

const history = createHistory()
let cpuEntropyBits

export default class App extends Component {

  static initialState = {entropyCount: 0}

  constructor() {
    super()
    this.state = App.initialState
  }

  componentWillMount() {
    // cpuEntropyBits = 0 // fast weeker key (for development only) 
    // this.newWallet() // short-cuts for development only
    // this.onSubmitPassword({password: '', hint: ''}) 
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

  onEntropyEvent = e => {
    if(e.type === 'mousemove') {
      key_utils.addEntropy(e.pageX, e.pageY, e.screenX, e.screenY)
    } else {
      console.log('onEntropyEvent Unknown', e.type, e)
    }
    this.setState({entropyCount: this.state.entropyCount + 1})
  }

  newWallet = () => {
    const waitForRenderMs = 100
    this.setState(
      {generating: true},
      () => {setTimeout(() => {go()}, waitForRenderMs)}
    )
    const go = () => {
      const mnemonic = randomMnemonic(24, cpuEntropyBits)
      this.setState(
        {generating: false, mnemonic, isBip39: true},
        () => {history.push()}
      )
    }
  }

  openWallet = (mnemonic, isBip39) => {
    this.setState({ mnemonic, isBip39 }, () => {
      history.push()
    })
  }

  onSubmitPassword = ({password, hint}) => {
    const {mnemonic} = this.state
    const {wif, pubkey, accountId} = mnemonicKeyPair(mnemonic, password)
    this.setState({wif, pubkey, accountId, hint})
  }

  render() {
    const {generating, entropyCount} = this.state
    const {mnemonic, isBip39} = this.state
    const {wif, pubkey, hint, accountId} = this.state

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h3>Wallet Key Tool</h3>
        </div>
        <br />
        
        {!mnemonic && !generating &&
        <div className="App-intro" onMouseMove={this.onEntropyEvent}>
          <div className="container">
            <div className="row">
              <div className="col border border-info rounded">
                <fieldset>
                  <legend>New Wallet</legend>
                  <div>
                    <button onClick={this.newWallet}>
                      Go <small>(entropy {entropyCount}&hellip;)</small>
                    </button>
                    <br />
                    <br />
                  </div>
                </fieldset>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col border border-info rounded">
                <OpenWalletForm onSubmit={this.openWallet} />
              </div>
            </div>
          </div>
        </div>}

        {generating && <div className="App-intro">
          <h3>Creating Key</h3>
          <br/>
          Gathering entropy&hellip;
        </div>}

        {mnemonic && <div className="App-body">
          {!accountId && <div>
            <EnterPasswordForm onSubmit={this.onSubmitPassword}/>
          </div>}

          {accountId && <div>
            <MnemonicKeyCard {...{mnemonic, hint, isBip39, accountId}}/>
            <br />
            <br />
            {/*<div>
              <PrivateKeyCard {...{wif, pubkey, hint, accountId}}/>
              <br />
              <br />
              <PublicKeyCard {...{pubkey, hint}} />
            </div>*/}
          </div>}
        </div>}
        <br />
        <br />
        <br />
      </div>
    )
  }
}

const OpenWalletForm = (props) => {
  const submit = ({mnemonic}) => {
    mnemonic = normalize(mnemonic)
    const v = validSeed(mnemonic)
    if(v.valid) {
      props.onSubmit(mnemonic, true)
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
      onConfirm: () => {props.onSubmit(mnemonic, false)}
    })
  }
  return (
    <Form onValidSubmit={submit} >
      <fieldset>
        <legend>Open Wallet</legend>
        <div className="row">
          <div className="col">
            <Textarea rows="2" cols="60" required
              name="mnemonic" label="Mnemonic Phrase"
              help="Private Mnemonic Phrase (Bip39,&nbsp;24&nbsp;words)"
            />
          </div>
          <div className="col-2">
            &nbsp;
          </div>
        </div>
        <br />
        <button>Open</button>
        <br/>
        <br/>
      </fieldset>
    </Form>
  )
}

class EnterPasswordForm extends React.Component {
  componentDidMount() {
    this.passwordRef.element.focus()
  }

  submit = ({password, hint = 'empty'}) =>
    this.props.onSubmit({password, hint})

  render = () => (
    <fieldset>
      <legend>Create Passphrase</legend>

      Create a short passphrase that will be easy to remember.  This is not the 
      same as a typical password (see points below).  This will be combined with a very
      strong Mnemonic Phrase and used to create your private credentials.
      <br />
      <br />

      <Form onValidSubmit={this.submit}>
        <fieldset>
          <legend>Passphrase (optional)</legend>
          <br />
          <Input
            type="password" name="password" label="Passphrase"
            value="" autoComplete="off"
            componentRef={component => {
              this.passwordRef = component
            }}
          />

          <Input
            type="password" name="confirm" label="Confirm"
            value="" autoComplete="off"
            validations="equalsField:password"
            validationErrors={{
              equalsField: 'Passwords must match.'
            }}
          />

          <ul>
            <li>Every passphrase creates different credentials</li>
            <li>Every passphrase is valid (including no passphrase)</li>
            <li>This passphrase acts like an additional word added the Mnemonic Key</li>
            <li>Consider a passphrase you can share with those you trust</li>
            <li>No passphrase, no private key, no funds</li>
            <li>Password is case sensitive</li>
          </ul>
        </fieldset>
        <br />

        <fieldset>
          <legend>Passphrase Hint (recommended)</legend>
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
// formNoValidate

const MnemonicKeyCard = ({mnemonic, hint, isBip39, accountId}) => (
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
            <AccountIcon accountId={accountId} />
          </div>
          <SpanSelect className="CopyText">{mnemonic}</SpanSelect>

          <ul>
            <li>Carefully write down all 24 words in order</li>
            <li>Write down your Password Hint: <u>{hint}</u></li>
            <li>Write down your Account ID: <u>{accountId}</u></li>
            <li>If saving on a USB or Removable drive, safely eject and re-open</li>
            <li>Your funds could be stolen if you use your mnemonic key on a malicious/phishing site</li>
            <li>You are the only person with this key, no phrase or password no funds</li>
          </ul>
        </fieldset>
      </div>
    </div>
  </fieldset>
)
// <li>Secure this information as if it were worth your weight in gold</li>

const AccountIcon = ({accountId}) => {
  let hash = accountId.toString(16)
  // jdenticon requires 11 characters minimum
  // hash = '0'.repeat(9 - hash.length) + hash
  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <Identicon hash={hash} />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <p className="text-center">Acct: {accountId}</p>
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
          <li>Password Hint: <u>{hint}</u></li>
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
            <li>Password Hint: "<u>{hint}</u>"</li>
            <li>Give out this public key to receive payments.</li>
            <li>You may use this <b>Public Key</b> as your <b>EOS claim key</b>.</li>
          </ul>
        </fieldset>
      </div>
    </div>
  </fieldset>
)

const mnemonicKeyPair = (mnemonic, password) => {
  const I = bip39.mnemonicToSeed(mnemonic, password)
  const IL = I.slice(0, 32)
  const IR = I.slice(32)

  const privateKey = PrivateKey.fromBuffer(IL)
  const wif = privateKey.toString()
  const pubkey = privateKey.toPublic().toString()
  const accountId = IR.readUInt16LE(0)

  return {wif, pubkey, accountId}
}

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
