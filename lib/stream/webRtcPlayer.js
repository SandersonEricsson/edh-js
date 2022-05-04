"use strict";

// Copyright 1998-2018 Epic Games, Inc. All Rights Reserved.
// universal module definition - read https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/

(function(root, factory) {
  var define = define || {};
  if (typeof define === "function" && define.amd) {
    define(["webrtc-adapter"], factory);
  } else if (typeof exports === "object") {

    module.exports = factory(require("webrtc-adapter"));
  } else {

    root.webRtcPlayer = factory(root.adapter);
  }
})(undefined, function(adapter) {
  function webRtcPlayer(parOptions) {
    parOptions = parOptions || {};

    var self = this;

    this.cfg = parOptions.peerConnectionOptions || {};
    this.cfg.sdpSemantics = "unified-plan";
    this.pcClient = null;
    this.dcClient = null;
    this.tnClient = null;

    this.sdpConstraints = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    };

    this.dataChannelOptions = { ordered: true };


    const createWebRtcVideo = function() {
      var video = document.createElement("video");

      video.id = "streamingVideo";
      video.playsInline = true;
      video.addEventListener(
        "loadedmetadata",
        function(e) {
          if (self.onVideoInitialised) {
            self.onVideoInitialised();
          }
        },
        true
      );
      return video;
    };

    this.video = createWebRtcVideo();

    const onsignalingstatechange = function(state) {
      console.info("signaling state change:", state);
    };

    const oniceconnectionstatechange = function(state) {
      console.info("ice connection state change:", state);
    };

    const onicegatheringstatechange = function(state) {
      console.info("ice gathering state change:", state);
    };

    const handleOnTrack = function(e) {
      console.log("handleOnTrack", e.streams);
      if (self.video.srcObject !== e.streams[0]) {
        console.log("setting video stream from ontrack");
        self.video.srcObject = e.streams[0];
      }
    };

    const setupDataChannel = function(pc, label, options) {
      try {
        var datachannel = pc.createDataChannel(label, options);
        console.log(`Created datachannel (${label})`);

        datachannel.onopen = function(e) {
          console.log(`data channel (${label}) connect`);
          if (self.onDataChannelConnected) {
            self.onDataChannelConnected();
          }
        };

        datachannel.onclose = function(e) {
          console.log(`data channel (${label}) closed`);
        };

        datachannel.onmessage = function(e) {
          console.log(`Got message (${label})`, e.data);
          if (self.onDataChannelMessage) self.onDataChannelMessage(e.data);
        };

        return datachannel;
      } catch (e) {
        console.warn("No data channel", e);
        return null;
      }
    };

    const onicecandidate = function(e) {
      console.log("ICE candidate", e);
      if (e.candidate) {
        self.onWebRtcCandidate(JSON.stringify(e.candidate));
      }
    };

    const handleCreateOffer = function(pc) {
      pc.createOffer(self.sdpConstraints).then(
        function(offerDesc) {
          pc.setLocalDescription(offerDesc);
          if (self.onWebRtcOffer) {
            offerDesc.sdp = offerDesc.sdp.replace(
              /(a=fmtp:\d+ .*level-asymmetry-allowed=.*)\r\n/gm,
              "$1;x-google-start-bitrate=20000;x-google-max-bitrate=100000\r\n"
            );
            self.onWebRtcOffer(JSON.stringify(offerDesc));
          }
        },
        function() {
          console.warn("Couldn't create offer");
        }
      );
    };

    const setupPeerConnection = function(pc) {
      if (pc.SetBitrate)
        console.log("Hurray! there's RTCPeerConnection.SetBitrate function");

      pc.onsignalingstatechange = onsignalingstatechange;
      pc.oniceconnectionstatechange = oniceconnectionstatechange;
      pc.onicegatheringstatechange = onicegatheringstatechange;

      pc.ontrack = handleOnTrack;
      pc.onicecandidate = onicecandidate;
    };

    const generateAggregatedStatsFunction = function() {
      if (!self.aggregatedStats) self.aggregatedStats = {};

      return function(stats) {

        let newStat = {};
        stats.forEach(stat => {
          if (
            stat.type == "inbound-rtp" &&
            !stat.isRemote &&
            (stat.mediaType == "video" ||
              stat.id.toLowerCase().includes("video"))
          ) {
            newStat.timestamp = stat.timestamp;
            newStat.bytesReceived = stat.bytesReceived;
            newStat.framesDecoded = stat.framesDecoded;
            newStat.packetsLost = stat.packetsLost;
            newStat.bytesReceivedStart =
              self.aggregatedStats && self.aggregatedStats.bytesReceivedStart
                ? self.aggregatedStats.bytesReceivedStart
                : stat.bytesReceived;
            newStat.framesDecodedStart =
              self.aggregatedStats && self.aggregatedStats.framesDecodedStart
                ? self.aggregatedStats.framesDecodedStart
                : stat.framesDecoded;
            newStat.timestampStart =
              self.aggregatedStats && self.aggregatedStats.timestampStart
                ? self.aggregatedStats.timestampStart
                : stat.timestamp;

            if (self.aggregatedStats && self.aggregatedStats.timestamp) {
              if (self.aggregatedStats.bytesReceived) {
                newStat.bitrate =
                  (8 *
                    (newStat.bytesReceived -
                      self.aggregatedStats.bytesReceived)) /
                  (newStat.timestamp - self.aggregatedStats.timestamp);
                newStat.bitrate = Math.floor(newStat.bitrate);
                newStat.lowBitrate =
                  self.aggregatedStats.lowBitrate &&
                  self.aggregatedStats.lowBitrate < newStat.bitrate
                    ? self.aggregatedStats.lowBitrate
                    : newStat.bitrate;
                newStat.highBitrate =
                  self.aggregatedStats.highBitrate &&
                  self.aggregatedStats.highBitrate > newStat.bitrate
                    ? self.aggregatedStats.highBitrate
                    : newStat.bitrate;
              }

              if (self.aggregatedStats.bytesReceivedStart) {
                newStat.avgBitrate =
                  (8 *
                    (newStat.bytesReceived -
                      self.aggregatedStats.bytesReceivedStart)) /
                  (newStat.timestamp - self.aggregatedStats.timestampStart);
                newStat.avgBitrate = Math.floor(newStat.avgBitrate);
              }

              if (self.aggregatedStats.framesDecoded) {
                newStat.framerate =
                  (newStat.framesDecoded - self.aggregatedStats.framesDecoded) /
                  ((newStat.timestamp - self.aggregatedStats.timestamp) / 1000);
                newStat.framerate = Math.floor(newStat.framerate);
                newStat.lowFramerate =
                  self.aggregatedStats.lowFramerate &&
                  self.aggregatedStats.lowFramerate < newStat.framerate
                    ? self.aggregatedStats.lowFramerate
                    : newStat.framerate;
                newStat.highFramerate =
                  self.aggregatedStats.highFramerate &&
                  self.aggregatedStats.highFramerate > newStat.framerate
                    ? self.aggregatedStats.highFramerate
                    : newStat.framerate;
              }

              if (self.aggregatedStats.framesDecodedStart) {
                newStat.avgframerate =
                  (newStat.framesDecoded -
                    self.aggregatedStats.framesDecodedStart) /
                  ((newStat.timestamp - self.aggregatedStats.timestampStart) /
                    1000);
                newStat.avgframerate = Math.floor(newStat.avgframerate);
              }
            }
          }

          if (stat.type == "track" && stat.trackIdentifier == "video_label") {
            newStat.framesDropped = stat.framesDropped;
            newStat.framesReceived = stat.framesReceived;
            newStat.framesDroppedPercentage =
              (stat.framesDropped / stat.framesReceived) * 100;
            newStat.frameHeight = stat.frameHeight;
            newStat.frameWidth = stat.frameWidth;
            newStat.frameHeightStart =
              self.aggregatedStats && self.aggregatedStats.frameHeightStart
                ? self.aggregatedStats.frameHeightStart
                : stat.frameHeight;
            newStat.frameWidthStart =
              self.aggregatedStats && self.aggregatedStats.frameWidthStart
                ? self.aggregatedStats.frameWidthStart
                : stat.frameWidth;
          }

          if (
            stat.type == "candidate-pair" &&
            stat.hasOwnProperty("currentRoundTripTime")
          ) {
            newStat.currentRoundTripTime = stat.currentRoundTripTime;
          }
        });
        self.aggregatedStats = newStat;

        if (self.onAggregatedStats) self.onAggregatedStats(newStat);
      };
    };

    this.handleCandidateFromServer = function(iceCandidate) {
      console.log("ICE candidate: ", iceCandidate);
      let candidate = new RTCIceCandidate(iceCandidate);
      self.pcClient.addIceCandidate(candidate).then(_ => {
        console.log("ICE candidate successfully added");
      });
    };

    this.createOffer = function() {
      if (self.pcClient) {
        console.log("Closing existing PeerConnection");
        self.pcClient.close();
        self.pcClient = null;
      }
      self.pcClient = new RTCPeerConnection(self.cfg);
      setupPeerConnection(self.pcClient);
      self.dcClient = setupDataChannel(
        self.pcClient,
        "cirrus",
        self.dataChannelOptions
      );
      handleCreateOffer(self.pcClient);
    };

    this.receiveAnswer = function(answer) {
      console.log("Received answer", answer);
      var answerDesc = new RTCSessionDescription(answer);
      self.pcClient.setRemoteDescription(answerDesc);
    };

    this.close = function() {
      if (self.pcClient) {
        console.log("Closing existing peerClient");
        self.pcClient.close();
        self.pcClient = null;
      }
      if (self.aggregateStatsIntervalId)
        clearInterval(self.aggregateStatsIntervalId);
    };

    this.send = function(data) {
      if (self.dcClient && self.dcClient.readyState == "open") {
        self.dcClient.send(data);
      }
    };

    this.getStats = function(onStats) {
      if (self.pcClient && onStats) {
        self.pcClient.getStats(null).then(stats => {
          onStats(stats);
        });
      }
    };

    this.aggregateStats = function(checkInterval) {
      let calcAggregatedStats = generateAggregatedStatsFunction();
      let printAggregatedStats = () => {
        self.getStats(calcAggregatedStats);
      };
      self.aggregateStatsIntervalId = setInterval(
        printAggregatedStats,
        checkInterval
      );
    };
  }
  return webRtcPlayer;
});
