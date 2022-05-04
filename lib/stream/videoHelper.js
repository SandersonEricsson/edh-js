import inputHelper from "./inputHelper";
import { ControlSchemeType } from "./types";

export default function(
  webRtcPlayerObj,
  socket,
  responseEventListeners,
  addLatestStats
) {

  webRtcPlayerObj.onWebRtcOffer = function(offer) {
    console.log("offer");
    socket.emit("webrtc-offer", offer);
  };

  webRtcPlayerObj.onWebRtcCandidate = function(candidate) {
    socket.emit("webrtc-ice", candidate);
  };

  webRtcPlayerObj.onVideoInitialised = function() {
    console.log("Player Initializeds");
    function play() {
      setTimeout(() => {
        webRtcPlayerObj.video.play().catch(e => {
          console.log("retry");
          play();
        });
      }, 500);
    }
    play();
  };

  webRtcPlayerObj.onDataChannelConnected = function() {
    console.log("WebRTC connected, waiting for video");
  };

  socket.on("webrtc-ice", function(iceCandidate) {
    if (iceCandidate) webRtcPlayerObj.handleCandidateFromServer(iceCandidate);
  });

  webRtcPlayerObj.onDataChannelMessage = function(data) {
    console.log("ondata channel message");
    var view = new Uint8Array(data);
    if (view[0] == ToClientMessageType.QualityControlOwnership) {
      let ownership = view[1] == 0 ? false : true;
      if (qualityControlOwnershipCheckBox != null) {
        qualityControlOwnershipCheckBox.disabled = ownership;
        qualityControlOwnershipCheckBox.checked = ownership;
      }
    } else if (view[0] == ToClientMessageType.Response) {
      let response = new TextDecoder("utf-16").decode(data.slice(1));

      for (let listener of responseEventListeners.values()) {
        listener(response);
      }
    }
  };

  socket.on("webrtc-answer", function(webRTCData) {
    console.log("on webrtc-answer");
    webRtcPlayerObj.receiveAnswer(webRTCData);

    webRtcPlayerObj.onAggregatedStats = aggregatedStats => {
      addLatestStats(aggregatedStats, webRtcPlayerObj.video);
    };

    webRtcPlayerObj.aggregateStats(1 * 1000 );

    function print() {
      webRtcPlayerObj.getStats(s => {
        s.forEach(stat => {
          console.log(JSON.stringify(stat));
        });
      });
    }
  });

  const settings = {
    print_inputs: true,
    inputOptions: {
      fakeMouseWithTouches: true,
      controlScheme: ControlSchemeType.HoveringMouse,
      suppressBrowserKeys: true 
    }
  };

  const { registerInputs } = inputHelper(webRtcPlayerObj, settings);
  registerInputs(webRtcPlayerObj.video, settings);
}

const ToClientMessageType = {
  QualityControlOwnership: 0,
  Response: 1
};

var qualityControlOwnershipCheckBox;
