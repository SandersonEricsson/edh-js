import React, { Component, Slider, Typography } from "react";
import PixelStreamingContext from "./stream/pixel-streaming-context";
import "./stream/videoHelper";
import ResizeObserver from '@juggle/resize-observer';

class PixelVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      webRtcPlayerObj: {}
    };
  }

  componentDidMount() {
    console.log(this.props.clientConfig.peerConnectionOptions);
    let webRtcPlayerObj = new this.props.webRtcPlayer({
      peerConnectionOptions: this.props.clientConfig.peerConnectionOptions
    });

    console.log(webRtcPlayerObj);

    this.setState({
      webRtcPlayerObj: webRtcPlayerObj
    });

    this.props.setWebRTCPlayerObj(webRtcPlayerObj);

    this.refs.video.appendChild(webRtcPlayerObj.video);

    webRtcPlayerObj.video.style.setProperty("width", "100%");
    webRtcPlayerObj.video.style.setProperty("padding", "10px");

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        this.props.setVideoAspectRatio(webRtcPlayerObj.video);
        this.props.setPlayerAspectRatio(webRtcPlayerObj.video);
      }
    });

    resizeObserver.observe(webRtcPlayerObj.video);

    webRtcPlayerObj.video.addEventListener(
      "contextmenu",
      function(e) {
        e.preventDefault();
      },
      false
    );

    videoHelper(
      webRtcPlayerObj,
      this.props.socket,
      this.props.responseEventListeners,
      this.props.addLatestStats
    );
    webRtcPlayerObj.createOffer();
  }

  componentWillUnmount() {}

  render() {
    return (
        <div ref="video" style={{ width: "100%" }}></div>
    );
  }
}
import videoHelper from "./stream/videoHelper";

const style = {};

export default PixelVideo;

