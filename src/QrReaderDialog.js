import React, { Component } from 'react';
import PropTypes from 'prop-types'

import QrReader from 'react-qr-reader'

import ReactConfirmAlert from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

export default class QrReaderDialog extends Component {
  static propTypes = {

    /** Called with scanned data. */
    scan: PropTypes.func.isRequired,

    /**
      @arg {function} click - invoke to show dialog
      @return child component (button)
      @example <QrReaderDialog component={click => <button onClick={click}>Go</button>}
    */
    component: PropTypes.func.isRequired,

    /** @example {width: '21em', height: '15em'} */
    size: PropTypes.obj,

    title: PropTypes.string,
    message: PropTypes.string,
  }

  static defaultProps = {
    size: {width: '21em', height: '15em'},
    title: 'QR Code Reader',
    message: 'Hold up your QR code'
  }

  constructor() {
    super()
    this.state = {}
  }

  qrReaderClick = () => {
    this.setState({qrReader: true})
  }

  qrReaderCancel = () => {
    this.setState({qrReader: false})
  }

  scan = data => {
    if(data) {
      this.props.scan(data)
    }
  }

  render() {
    const {qrReader} = this.state
    const {component, size, title, message} = this.props
    const child = component(this.qrReaderClick)
    return (<span>
      {child}
      {qrReader && <span>
        <ReactConfirmAlert
          title={title} message={message}
          cancelLabel="Cancel" onCancel={this.qrReaderCancel}
          childrenElement={() => (<span>
            <QrReader onScan={this.scan} style={size} facingMode="rear" />
          </span>)}
        />
      </span>}
    </span>)
  }
}
