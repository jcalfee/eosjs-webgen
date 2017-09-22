import React from "react";
import {Component} from "react";
import PropTypes from 'prop-types';
import jdenticon from "jdenticon";

var canvas_id_count = 0;

export default class Identicon extends Component {

  static propTypes = {
    size: PropTypes.object.isRequired,
    hash: PropTypes.string
  }

  static defaultProps = {
    size: {height: 100, width: 100}
  }

  constructor(props) {
    super(props);
    this.canvas_id = "identicon_" + (this.props.hash||"") + (++canvas_id_count);
  }

  componentDidMount() {
    this.repaint();
  }
  
  shouldComponentUpdate(nextProps) {
    return
      nextProps.size.height !== this.props.size.height ||
      nextProps.size.width !== this.props.size.width ||
      nextProps.hash !== this.props.hash;
  }

  componentDidUpdate() {
    this.repaint();
  }

  render() {
    let {hash} = this.props;
    let {height, width} = this.props.size;
    return (
      <canvas id={this.canvas_id}
        ref="canvas"
        style={{height: height, width: width}}
        width={width * 2}
        height={height * 2}
        data-jdenticon-hash={hash}
      />
    );
  }
  
  repaint() {
    const {hash} = this.props
    if(hash) {
      jdenticon.update('#' + this.canvas_id, hash);
    } else {
      let ctx = this.refs.canvas.getContext('2d');
      ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
      let size = ctx.canvas.width;
      ctx.clearRect(0, 0, size, size);
      ctx.fillRect(0, 0, size, size);
      ctx.clearRect(0+1, 0+1, size-2, size-2);
      ctx.font = `${size}px sans-serif`;
      ctx.fillText("?", size/4, size - size/6);
    }
  }
}
