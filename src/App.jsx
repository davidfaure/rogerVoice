import React from "react";
import "./App.css";
import { io } from "socket.io-client";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import * as images from "./assets/img/index";

const socket = io("http://localhost:8080");

function App() {
  let timeOut = undefined;
  const [myId, setMyId] = React.useState("");
  const [chatRoom, setChatRoom] = React.useState();
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
  const [text, setText] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [typing, setTyping] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);

  const myVideo = React.useRef();
  const userVideo = React.useRef();
  const connectionRef = React.useRef();

  const stopTyping = () => {
    setTyping(false);
    socket.emit("typing", { typing: false });
  };

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("myId", (id, chatRoom) => {
      setMyId(id);
      setChatRoom(chatRoom);
    });

    socket.on("welcome", (data) => {
      const copy = messages;
      copy.push(data);
      setMessages([...copy]);
    });

    socket.on("allUsers", (users) => {
      setUsers(users);
    });

    socket.on("isTyping", (data) => {
      console.log("TYPING", data);
      setIsTyping(data.text);
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

    socket.on("message", (data) => {
      console.log("message from server", data);
      const copy = messages;
      copy.push(data);
      setMessages([...copy]);
    });
  }, []);

  const joinRoom = () => {
    socket.emit("join", { room: chatRoom, userName: name });
  };

  const sendMessage = () => {
    if (text !== "") {
      socket.emit("chat", text, name, chatRoom);
      setText("");
    }
  };

  console.log(messages, "message");

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

  console.log(chatRoom);

  return (
    <div className="App">
      <div className="Video-Container">
        <div className="Video-Container-Title">
          <div className="Video-Container-Title-Logo">
            <h2>Rogervoice Test</h2>
          </div>
          <div>
            {receivingCall && !callAccepted && (
              <h2>{callerName} vous appelle...</h2>
            )}
          </div>
          <div className="Video-Container-Title-Input">
            <div>
              <p className="Side-Container-Label">Mon nom :</p>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <CopyToClipboard text={myId}>
              <button className="Clipboard-Button">Copier mon id</button>
            </CopyToClipboard>
          </div>
          <div className="Video-Container-Input-Call">
            <div>
              <p className="Side-Container-Label">ID à appeler:</p>
              <input
                name="idToCall"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
              />
            </div>
            <div className="call-button">
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
          <div className="Video-Frame-Remote">
            {callAccepted && !callEnded && (
              <>
                <video
                  playsInline
                  ref={userVideo}
                  muted
                  autoPlay
                  id="user-video"
                />
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
        <h2>Chat Room</h2>
        <div className="Side-Container-Instructions">
          <ul>
            <li>Ouvrez deux onglets et renseignez un nom</li>
            <li>Copiez l&apos;ID d&apos;un des onglets</li>
            <li>Copier l&apos;ID dans l&apos;input ID à appeler</li>
            <li>
              Cliquer sur le bouton appeler et accepter l'appel sur l&apos;autre
              onglet
            </li>
          </ul>
        </div>
        <div className="Side-Container-Join-Button">
          {name && (
            <button onClick={joinRoom} className="Join-Button">
              Rejoindre la chat room
            </button>
          )}
        </div>
        <div className="Chat-Message-Container">
          <div className="Chat-Message">
            {messages.map((message) => {
              return (
                <div
                  className={
                    message.username === name ? "Message-Left" : "Message-Right"
                  }
                >
                  <div
                    className={
                      message.username === name
                        ? "Message-Background-Left"
                        : "Message-Background-Right"
                    }
                  >
                    <p>{message.text}</p>
                  </div>
                  {!message.welcome && <span>{message.username}</span>}
                </div>
              );
            })}
          </div>
          <span className="Is-Typing-Message">{isTyping}</span>
          <div className="Send-Message-Container">
            <input
              placeholder="Votre message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  clearTimeout(timeOut);
                  sendMessage();
                } else {
                  setTyping(true);
                  socket.emit("typing", { name, typing: true });
                  clearTimeout(timeOut);
                  timeOut = setTimeout(stopTyping, 3000);
                }
              }}
            />
            <img
              src={images.sendButton}
              alt="sendButton"
              onClick={sendMessage}
              className="Send-Message-Button"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
