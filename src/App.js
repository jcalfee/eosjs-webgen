import React, { Component } from 'react';
import { Form, Input, Textarea } from 'formsy-react-components'

import './App.css';
import './bootstrap.css';
import logo from './LogoData';

import QRCode from 'react-qr';
import {PrivateKey, key_utils} from 'eosjs-ecc';

import {randomMnemonic} from './mnemonic'
import {suggest, validSeed, normalize, bip39} from 'bip39-checker'
import {confirmAlert} from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

export default class App extends Component {

  constructor() {
    super()
    this.state = {entropyCount: 0}
  }

  componentDidMount() {
    // this.newWallet() // short-cut (development only)
  }

  // clearKeyPair = () => {
  //   this.setState({wif: null, pubkey: null})
  // }
  
  onEntropyEvent = e => {
    if(e.type === 'mousemove') {
      key_utils.addEntropy(e.pageX, e.pageY, e.screenX, e.screenY)
    } else {
      console.log('onEntropyEvent Unknown', e.type, e)
    }
    this.setState({entropyCount: this.state.entropyCount + 1})
  }

  newWallet = () => {
    this.setState({generating: true}, () => {
      setTimeout(() => {
        const mnemonic = randomMnemonic(24, 0)
        this.setState({ generating: false, mnemonic, isBip39: true })
      }, 100)
    })
  }

  openWallet = (mnemonic, isBip39) => {
    this.setState({ mnemonic, isBip39 })
  }

  onSubmitPassword = ({password, hint}) => {
    const {mnemonic} = this.state
    const {wif, pubkey} = mnemonicKeyPair(mnemonic, password)
    this.setState({wif, pubkey, hint})
  }

  render() {
    const {generating, mnemonic, isBip39, wif, pubkey, hint, entropyCount} = this.state

    return (
      <div className="App" onMouseMove={this.onEntropyEvent}>
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h3>Wallet Key Tool</h3>
        </div>
        
        <div className="App-intro">
          {!mnemonic && !generating && <div className="container">
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
          </div>}
        </div>

        <div className="App-intro">
          {generating ? <div>Gathering CPU Entropy&hellip;</div> : <div>&nbsp;</div>}

        </div>

        <div className="App-body">
          {mnemonic && <div>
            <DivSelect>
              <span className="btn-clipboard"/>
              <MnemonicKeyCard {...{mnemonic, hint, isBip39}}/>
              <br />
              <br />
              {wif && <div>
                <PrivateKeyCard {...{wif, pubkey, hint}}/>
                <br />
                <br />
                <PublicKeyCard {...{pubkey, hint}} />
              </div>}
            </DivSelect>
  
            {!wif && <div>
                <EnterPasswordForm onSubmit={this.onSubmitPassword}/>
            </div>}
          </div>}
        </div>
        <br /><br /><br />
      </div>
    );
  }
}
// <button onClick={this.clearKeyPair}>Clear</button>

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
              help="Private Mnemonic Phrase (Bip39&nbsp;24&nbsp;words)"
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

  submit = ({password, hint = password === '' ? 'empty' : ''}) =>
    this.props.onSubmit({password, hint})

  render = () => (
    <fieldset>
      <legend>Enter Password</legend>
      <br />

      Create a password to add security to your backup.  This is not
      a typical password, see the notes below.  You'll be provided
      a Mnemonic Key in the next step.
      <br />
      <br />
      <Form onValidSubmit={this.submit}>
        <fieldset>
          <legend>Password (optional)</legend>
          <br />
          <Input
            type="password" name="password" label="Password"
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
            <li>Every password is valid (including no password)</li>
            <li>Every password will create a different private key</li>
            <li>This password acts like an additional word added the Mnemonic Key</li>
            <li>Consider a password you can share with those you trust</li>
            <li>No password, no private key, no funds</li>
            <li>Password is case sensitive</li>
          </ul>
        </fieldset>
        <br />

        <fieldset>
          <legend>Password Hint (optional)</legend>
          This will appear on your backup.
          <br />
          <br />

          <Input name="hint" label="Password Hint" />
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

const MnemonicKeyCard = ({mnemonic, hint, isBip39}) => (
  <fieldset>
    {!isBip39 && <div>
      <h3>
        <p className="text-center text-warning text-dark">
          <b>Warning: Non-Bip39 Mnemonic Phrase</b>
        </p>
      </h3>
    </div>}

    <div className="row">
      <div className="col">
        <fieldset>
          <legend style={{whiteSpace: 'nowrap'}}>Private Mnemonic Phrase</legend>
          <QRCode text={mnemonic}/>
          <br />
          <small>[{isBip39 ? '' : 'Non-'}Bip39] Starts With: {mnemonic.split(' ').slice(0, 3).join(' ')} &hellip;</small>
        </fieldset>
      </div>
      <div className="col">
        <fieldset>
          <legend>Private Mnemonic Phrase <small>({isBip39 ? '' : 'Non-'}Bip39)</small></legend>
          <SpanSelect className="CopyText">{mnemonic}</SpanSelect>
          <ul>
            <li>You are the key keeper, no phrase no funds</li>
            <li>Carefully write down all 24 words in order</li>
            {hint && <li>Write down your Password Hint: "<u>{hint}</u>"</li>}
            <li>Your funds could be stolen if you use your mnemonic key on a malicious/phishing site</li>
            <li>USB or Removable drives: safely eject then re-open to verify</li>
          </ul>
        </fieldset>
      </div>
    </div>
  </fieldset>
)
// <li>Secure this information as if it were worth your weight in gold</li>

const PrivateKeyCard = ({wif, pubkey, hint}) => (
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
          <li>Password Hint: "<u>{hint}</u>"</li>
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
  const privateKey = PrivateKey.fromBuffer(IL)
  const wif = privateKey.toString()
  const pubkey = privateKey.toPublic().toString()
  return {wif, pubkey}
}

const selectAll = e => {
  const element = e.target
  // console.log('e', e); e.persist()
  const selection = window.getSelection()
  const range = document.createRange()
  
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}

const SpanSelect = ({children, ...childProps}) => {
  return <span onClick={selectAll} {...childProps}>{children}</span>
}

const DivSelect = ({children, ...childProps}) => {
  return <div onClick={selectAll} {...childProps}>{children}</div>
}
