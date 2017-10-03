import React, {PureComponent} from 'react';
import PropTypes from 'prop-types'

import {EntropyCount} from '../Entropy'

export default class NewWallet extends PureComponent {
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

