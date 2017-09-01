import React, { Component } from 'react';
import QRCode from 'react-qr';

import logo from './logo.png';
import './App.css';
import './spinner.css';

import {PrivateKey, key_utils} from 'eosjs-ecc';

class App extends Component {

  constructor() {
    super()
    this.state = {entropyCount: 0}
  }
  
  // componentDidMount() {
  //   this.newKeyPair() // development
  // }

  newKeyPair = () => {
    this.setState({generating: true}, () => {
      setTimeout(() => {
        const priv = PrivateKey.randomKey()
        const wif = priv.toString()
        const pubkey = priv.toPublic().toString()
        this.setState({generating: false, wif, pubkey})
      })
    })
  }

  clearKeyPair = () => {
    this.setState({wif: null, pubkey: null})
  }
  
  onEntropyEvent = e => {
    if(e.type === 'mousemove') {
      key_utils.addEntropy(e.pageX, e.pageY, e.screenX, e.screenY)
    } else {
      console.log('onEntropyEvent Unknown', e.type, e)
    }
    this.setState({entropyCount: this.state.entropyCount + 1})
  }
  
  render() {
    const {generating, wif, pubkey, entropyCount} = this.state

    return (
      <div className="App" onMouseMove={this.onEntropyEvent}>
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>EOS Blockchain Wallet</h2>
        </div>
        
        <div className="App-intro">
          {!wif && !generating && <div>
            <button onClick={this.newKeyPair}>Create New Wallet</button>
            <br/>
            <br/>
            <br/>
            <small>Gathering mouse entropy: {entropyCount}</small>
          </div>}
          {generating ? <div>Gathering CPU Entropy...</div> : <div>&nbsp;</div>}
        </div>
        
        <div className="App-body">
          {wif && <div>
            <DivSelect>
              <fieldset>
                <legend>EOS Blockchain Wallet</legend>
                <table>
                  <tbody>
                    <tr>
                      <td>Public Key</td>
                      <td>
                        <SpanSelect className="CopyText">{pubkey}</SpanSelect>
                      </td>
                    </tr>
                    <tr>
                      <td>Private Key</td>
                      <td>
                        <SpanSelect className="CopyText">{wif}</SpanSelect>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </fieldset>
            </DivSelect>
            
            <table>
              <tbody>
                <tr>
                  <td>
                    <fieldset>
                      <legend>Public Key QR Code</legend>
                      <QRCode text={pubkey}/>
                    </fieldset>
                  </td>
                  <td style={{width: '100%'}}>&nbsp;</td>
                  <td>
                    <fieldset>
                      <legend>Private Key QR Code</legend>
                      <QRCode text={wif}/>
                    </fieldset>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <ul>
              <li>You may use the <b>Public Key</b> as your <b>EOS claim key</b>.</li>
              <li>Keep the <b>Private Key</b> private.  Your funds will be stolen if you use your private key on a malicious/phishing site.</li>
              <li>Back up this information in multiple safe locations. If you
              use a USB stick, make sure to safely eject the device.  Secure it as if it could be worth a slug of gold one day.</li>
            </ul>

          </div>}
        </div>
      </div>
    );
  }
}
// <button onClick={this.clearKeyPair}>Clear</button>


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

export default App;
