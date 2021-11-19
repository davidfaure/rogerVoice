import React from "react";
import "./App.css";
import { io } from "socket.io-client";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import * as images from "./assets/img/index";

const socket = io("http://localhost:8080");

function App() {
  const [myId, setMyId] = React.useState("");
  const [users, setUsers] = React.useState();
  const [muteVideo, setMutedVideo] = React.useState(false);
  const [muteAudio, setMutedAudio] = React.useState(false);
  const [idToCall, setIdToCall] = React.useState("");
  const [stream, setStream] = React.useState();
  const [receivingCall, setReceivingCall] = React.useState(false);
  const [caller, setCaller] = React.useState("");
  const [callerSignal, setCallerSignal] = React.useState();
  const [callAccepted, setCallAccepted] = React.useState(false);
  const [callEnded, setCallEnded] = React.useState(false);
  const [name, setName] = React.useState("");
  const [callerName, setCallerName] = React.useState("");

  const myVideo = React.useRef();
  const userVideo = React.useRef();
  const connectionRef = React.useRef();

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("myId", (id) => {
      setMyId(id);
    });

    socket.on("allUsers", (users) => {
      setUsers(users);
    });

    socket.on("stopCall", () => {
      console.log("call ended");
      setCallEnded(true);
      window.location.reload();
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun.services.mozilla.com" },
          { urls: "stun:stun.stunprotocol.org:3478" },
          { url: "stun:stun.l.google.com:19302" },
          { url: "stun:stun.services.mozilla.com" },
          { url: "stun:stun.stunprotocol.org:3478" },
        ],
      },
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: myId,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket.on("callAccepted", (signal, userName) => {
      setCallAccepted(true);
      setCallerName(userName);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: caller,
        nameCaller: name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    socket.emit("callEnded");
  };

  const muteMe = () => {
    stream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setMutedAudio(!muteAudio);
  };

  const stopVideo = () => {
    stream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setMutedVideo(!muteVideo);
  };

  return (
    <div className="App">
      <div className="Video-Container">
        <div className="Video-Container-Title">
          <h1>Home</h1>
        </div>
        <div className="Video-Frame-Container">
          <div className="Video-Frame-User">
            {stream && (
              <>
                <video playsInline muted ref={myVideo} autoPlay />
                <div className="Video-Frame-User-Name">
                  <p>{name ? name : "Votre nom"}</p>
                  <div
                    className={
                      name
                        ? "Video-Frame-User-Name-Connected"
                        : "Video-Frame-User-Name-Disconnected"
                    }
                  />
                </div>
              </>
            )}
          </div>
          <div className="Video-Frame-Remote">
            {callAccepted && !callEnded && (
              <>
                <video playsInline ref={userVideo} autoPlay id="user-video" />
                <div className="Video-Frame-User-Name">
                  <p>{callerName}</p>
                  <div className="Video-Frame-User-Name-Connected" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="Video-Frame-Control">
          <img
            src={muteAudio ? images.stopMic : images.activeMic}
            alt="Mute-Unmute"
            onClick={muteMe}
            onKeyDown={() => {}}
            role="presentation"
            className="Audio-Button"
          />
          {receivingCall && !callAccepted && (
            <img
              src={images.acceptCall}
              alt="acceptCall"
              onClick={answerCall}
              onKeyDown={() => {}}
              role="presentation"
              className="Call-Button"
            />
          )}
          {callAccepted && !callEnded && (
            <img
              src={images.endCall}
              alt="endCall"
              onClick={leaveCall}
              onKeyDown={() => {}}
              role="presentation"
              className="End-Button"
            />
          )}
          <img
            src={muteVideo ? images.stopVideo : images.activeVideo}
            alt="Mute-Unmute"
            onClick={stopVideo}
            onKeyDown={() => {}}
            role="presentation"
            className="Video-Button"
          />
        </div>
      </div>
      <div className="Side-Container">
        <div>
          <p>Mon nom :</p>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <CopyToClipboard text={myId}>
          <button>Copier mon id</button>
        </CopyToClipboard>
        <p> mon id : {myId}</p>
        <p>id de la personne à appeler:</p>
        <input
          name="idToCall"
          value={idToCall}
          onChange={(e) => setIdToCall(e.target.value)}
        />
        <div className="call-button">
          {callAccepted && !callEnded ? (
            <button variant="contained" color="secondary" onClick={leaveCall}>
              End Call
            </button>
          ) : (
            <button
              color="primary"
              aria-label="call"
              onClick={() => callUser(idToCall)}
            >
              Call
            </button>
          )}
          {idToCall}
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div>
              <h1>{callerName} vous appelle...</h1>
              <button onClick={answerCall}>Répondre</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
