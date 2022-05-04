let webRtcPlayer = require("./webRtcPlayer");
let io = require("socket.io-client");

var responseEventListeners = new Map();

var t0 = Date.now();
function log(str) {
  console.log(`${Math.floor(Date.now() - t0)}: ` + str);
}

function addResponseEventListener(name, listener) {
  responseEventListeners.set(name, listener);
}

function removeResponseEventListener(name) {
  responseEventListeners.remove(name);
}

function requestQualityControl() {
  sendInputData(new Uint8Array([MessageType.RequestQualityControl]).buffer);
}

function connect(host, actions) {
  const socket = io("localhost:8888");

  actions.updateSocket(socket);
  actions.updateWebRTCStat("socketConnecting"); 

  socket.on("clientConfig", function(clientConfig) {
    console.log("update clientConfig: " + clientConfig);
    actions.updateClientConfig(clientConfig);
  });

  socket.on("message", function(data) {
    console.log(
      `unrecognised message ${data.byteLength}: ${data
        .slice(0, 50)
        .toString("hex")}`
    );
  });

  socket.on("connect", () => {
    actions.updateWebRTCStat("socketConnected");

    log("connected");
    sendUserConfig(actions, socket);
  });

  socket.on("error", error => {
    actions.updateWebRTCStat(error);
    console.log(`WS error ${error}`);
  });

  socket.on("disconnect", reason => {
    actions.updateWebRTCStat("socketDisConnected");

    console.log(`Connection is closed: ${reason}`);
    socket.close();
    connect(
      host,
      actions
    );
  });
}

function sendUserConfig(actions, socket) {
  let userConfig = {
    emitData: "ArrayBuffer"
  };
  let userConfigString = JSON.stringify(userConfig);
  log(`userConfig = ${userConfigString}`);
  actions.updateWebRTCStat("webrtcConnecting");
  socket.emit("userConfig", userConfigString);
}


function load() {
  registerKeyboardEvents();
}

module.exports = {
  load,
  connect,
  addResponseEventListener,
  removeResponseEventListener,
  webRtcPlayer: webRtcPlayer,
  responseEventListeners: responseEventListeners
};