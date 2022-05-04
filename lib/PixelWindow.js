import React, { Component } from "react";
import PixelStreamingContext from "./lib/pixel-streaming-context";
import PixelVideo from "./PixelVideo";

class PixelWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.load();

    this.props.connect(this.props.host, this.props.actions);
  }

  componentWillUnmount() {}

  render() {
    console.log(this.props.windowStyle);
    return (
      <div style={this.props.windowStyle}
          onMouseEnter={e=>{
          }}

          onMouseLeave={e=>{
          }}
      >
        <div id="player" className="fixed-size" style={this.props.videoStyle}>
          <div id="videoPlayOverlay">
            <PixelStreamingContext.Consumer>
                {context => 
                    context.clientConfig?
                      <PixelVideo
                        clientConfig={context.clientConfig}
                        webRtcPlayer={context.webRtcPlayer}
                        responseEventListeners={context.responseEventListeners}
                        socket={context.socket}
                        setVideoAspectRatio={context.actions.setVideoAspectRatio}
                        setPlayerAspectRatio={context.actions.setPlayerAspectRatio}
                        addLatestStats={context.actions.addLatestStats}
                        setWebRTCPlayerObj={context.actions.setWebRTCPlayerObj}
                      /> : PlayerComponent(context)
                }
                {}
            </PixelStreamingContext.Consumer>
          </div>
        </div>
      </div>
    );
  }
}

export default PixelWindow;

const PlayerComponent = (webrtcState, clientConfig) => {
  if (webrtcState === "loading") return <div>{webrtcState}</div>;
  if (webrtcState === "disConnected") return <div>{webrtcState}</div>;
  if (webrtcState === "connecting") return <div>{webrtcState}</div>;
  if (webrtcState === "connected") return <div>{webrtcState}</div>;
  if (webrtcState === "playing") return <div>{webrtcState}</div>;
  if (webrtcState === "stop") return <div>{webrtcState}</div>;
  return null;
};
