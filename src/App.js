import './App.css';
// import './bootstrap.css';

import logo from './LogoData';

import React, {Component} from 'react';

import MnemonicKeyCard from './MnemonicKeyCard'
import DerivedChildren from './DerivedChildren'
import BackupConfirm from './BackupConfirm'
import InputPassphrase from './Form/InputPassphrase'
import OpenWallet from './Form/OpenWallet'
import KeyGen from './Form/KeyGen'

import {EntropyContainer} from './Entropy'

import createHistory from 'history/createBrowserHistory'

import {mnemonicSeed} from './mnemonic'

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
    // this.openWallet('mnemonic') // short-cuts for development only
    // this.onSubmitPassword({password: '', hint: ''}) // dev only
  }

  componentDidMount() {
    history.listen((location, action) => {
      // console.log(action, location.pathname, location.state)
      if(action === 'POP') {
        if(this.state.children) {
          this.setState({children: null})

        } else if(this.state.wif) {
          this.setState({
            wif: null,
            pubkey: null,
            accountId: null
          })

        } else if(this.state.seed) {
          this.state = App.initialState
          this.setState()

        } else if(this.state.mnemonic) {
          this.state = App.initialState
          this.setState()
        }
      }
    })
  }

  newWallet = (mnemonic, multiWallet) => {
    const {pubkeyBuffer} = mnemonicSeed(mnemonic)('mnemonic-id')
    const mnemonicId = pubkeyBuffer.readUInt16LE(0)
    this.setState({
      mnemonic, mnemonicId,
      isBip39: true, newWallet: true
    }, () => {
      history.push()
      if(!multiWallet) {
        this.onSubmitPassword({password: ''})
      }
    })
  }

  openWallet = (mnemonic, isBip39, multiWallet) => {
    const {pubkeyBuffer} = mnemonicSeed(mnemonic)('mnemonic-id')
    const mnemonicId = pubkeyBuffer.readUInt16LE(0)
    this.setState({
      mnemonic, mnemonicId,
      isBip39, newWallet: false
    }, () => {
      history.push()
      if(!multiWallet) {
        this.onSubmitPassword({password: ''})
      }
    })
  }

  loginWallet = ({mnemonic, accountId}) => {
    this.setState({mnemonic, accountId}, () => {
      history.push()
    })
  }

  onSubmitPassword = ({password, hint}) => {
    const {mnemonic} = this.state
    const seed = mnemonicSeed(mnemonic, password)
    this.setState({seed, hint}, () => {
      // history.push()
    })
  }

  backup = () => {
    this.setState({newWallet: false})
  }

  keyGenerated = children => {
    this.setState({children}, () => {
      history.push()
    })
  }

  child = child => {
    const {wif, pubkey, pubkeyBuffer} = child
    const accountId = pubkeyBuffer.readUInt16LE(0)
    this.setState({wif, pubkey, accountId}, () => {
      history.push()
    })
  }

  render() {
    const {mnemonic, mnemonicId, isBip39, newWallet} = this.state
    const {seed, children} = this.state
    const {wif, pubkey, hint, accountId} = this.state

    return (
      <EntropyContainer>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h3>Wallet Key Tool</h3>
          </div>
          <br />
          {!mnemonic ?
            <div className="App-intro">
              <div className="ui container">
                <div className="row">
                  <div className="col border border-info rounded">
                      <OpenWallet
                        onSubmit={this.openWallet}
                        newWallet={this.newWallet}
                        {...{cpuEntropyBits}}
                      />
                  </div>
                </div>
              </div>
            </div>

          : mnemonic && newWallet ?
            <div className="App-body">
              <h1>Backup</h1>
              <MnemonicKeyCard {...{mnemonic, mnemonicId, isBip39}}/>
              <br />
              <br />
              <BackupConfirm onClick={this.backup}/>
            </div>

          : mnemonic && !seed ?
            <div className="App-body">
              <InputPassphrase {...{mnemonicId}} 
                onSubmit={this.onSubmitPassword}/>
            </div>

          : seed && !children ?
            <div className="App-body">
              <KeyGen onSubmit={this.keyGenerated} {...{seed}} />
            </div>

          : children && !wif ?
            <div className="App-body">
              <DerivedChildren {...{children, hint}} />
            </div>

          : null}
        </div>
      </EntropyContainer>
    )
  }
}


