import './App.css';
import './bootstrap.css';
import logo from './LogoData';

import React, {Component} from 'react';

import PrivateKeyCard from './PrivateKeyCard'
import PublicKeyCard from './PublicKeyCard'
import MnemonicKeyCard from './MnemonicKeyCard'
import InputPassphrase from './Form/InputPassphrase'
import OpenWallet from './Form/OpenWallet'

import {EntropyContainer} from './Entropy'

import createHistory from 'history/createBrowserHistory'

import {mnemonicKeyPair, mnemonicIv} from './mnemonic'

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
    this.setState({ mnemonic, mnemonicId, isBip39: true, newWallet: true }, () => {
      history.push()
    })
  }

  openWallet = (mnemonic, isBip39) => {
    const mnemonicId = mnemonicIv(mnemonic, "mnemonicId").readUInt16LE(0)
    this.setState({ mnemonic, mnemonicId, isBip39, newWallet: false }, () => {
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
    const {mnemonic, mnemonicId, isBip39, newWallet} = this.state
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
                  <OpenWallet
                    onSubmit={this.openWallet}
                    newWallet={this.newWallet}
                    {...{cpuEntropyBits}}
                  />
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
            {mnemonic && newWallet && <div>
              <MnemonicKeyCard {...{mnemonic, mnemonicId, isBip39}}/>
              <br />
              <br />
            </div>}

            {mnemonic && !wif && <div>
              <InputPassphrase {...{mnemonicId}} 
                onSubmit={this.onSubmitPassword}/>
            </div>}

            {wif && <div>
              <h1>Warning</h1>
              <b>The Mnemonic to Private Key calculation will change.</b>
              <br />
              <br />
              <br />

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


