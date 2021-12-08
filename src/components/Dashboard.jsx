import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import * as images from "../assets/img/index";

const Dashboard = ({ socket, name, myId }) => {
  const [stream, setStream] = React.useState();
  const [idToCall, setIdToCall] = React.useState("");
  const [callAccepted, setCallAccepted] = React.useState(false);
  const [callEnded, setCallEnded] = React.useState(false);
  const [callerName, setCallerName] = React.useState("");
  const [receivingCall, setReceivingCall] = React.useState(false);
  const [callerSignal, setCallerSignal] = React.useState();
  const [muteVideo, setMutedVideo] = React.useState(false);
  const [muteAudio, setMutedAudio] = React.useState(false);
  const [caller, setCaller] = React.useState("");
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
    if (idToCall) {
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
    }
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
    <div className="Video-Container">
      <div className="Video-Container-Title">
        <div className="Header-Left">
          <img src={images.logoRogervoice} alt="logo" className="Logo-Header" />
          <h2>Chat Voice App</h2>
        </div>
        <div className="Header-Right">
          <div className="Video-Container-Title-Logo">
            <h2>{name}</h2>
            <CopyToClipboard text={myId}>
              <button className="Clipboard-Button">Copier mon id</button>
            </CopyToClipboard>
          </div>
          <div className="Video-Container-Calling">
            {receivingCall && !callAccepted && (
              <h2>{callerName} vous appelle...</h2>
            )}
          </div>
          <div className="Video-Container-Input-Call">
            <input
              placeholder="ID to call"
              name="idToCall"
              value={idToCall}
              onChange={(e) => setIdToCall(e.target.value)}
            />
            <img
              src={images.acceptCall}
              alt="acceptCall"
              onClick={() => callUser(idToCall)}
              onKeyDown={() => {}}
              role="presentation"
              className="Call-Button-Title"
            />
          </div>
        </div>
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
        {callAccepted && !callEnded && (
          <div className="Video-Frame-Remote">
            <>
              <video
                playsInline
                ref={userVideo}
                muted
                autoPlay
                id="user-video"
              />
              <div className="Video-Frame-User-Name-Remote">
                <p>{callerName}</p>
              </div>
            </>
          </div>
        )}
      </div>
      <div className="Video-Frame-Control">
        <div className="Video-Frame-Control-Detail">
          <img
            src={muteAudio ? images.stopMic : images.activeMic}
            alt="Mute-Unmute"
            onClick={muteMe}
            onKeyDown={() => {}}
            role="presentation"
            className="Audio-Button"
          />
          <p>Micro</p>
        </div>
        {receivingCall && !callAccepted && (
          <div className="Video-Frame-Control-Detail">
            <img
              src={images.acceptCall}
              alt="acceptCall"
              onClick={answerCall}
              onKeyDown={() => {}}
              role="presentation"
              className="Call-Button"
            />
            <p>Répondre</p>
          </div>
        )}
        {callAccepted && !callEnded && (
          <div className="Video-Frame-Control-Detail">
            <img
              src={images.endCall}
              alt="endCall"
              onClick={leaveCall}
              onKeyDown={() => {}}
              role="presentation"
              className="End-Button"
            />
            <p>Raccrocher</p>
          </div>
        )}
        <div className="Video-Frame-Control-Detail">
          <img
            src={muteVideo ? images.stopVideo : images.activeVideo}
            alt="Mute-Unmute"
            onClick={stopVideo}
            onKeyDown={() => {}}
            role="presentation"
            className="Video-Button"
          />
          <p>Caméra</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
