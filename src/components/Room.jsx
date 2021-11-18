import React from "react";
import JsSIP from "jssip";

const Room = () => {
  const socket = new JsSIP.WebSocketInterface("wss://sip.antisip.com:4443");
  const configuration = {
    sockets: [socket],
    uri: "sip:david33@sip.antisip.com",
    realm: "sip.example.com",
    display_name: "david33",
  };

  const ua = new JsSIP.UA(configuration);

  ua.start();

  // Register callbacks to desired call events
  const eventHandlers = {
    progress: function (e) {
      console.log("call is in progress");
    },
    failed: function (e) {
      console.log("call failed with cause: " + e.data.cause);
    },
    ended: function (e) {
      console.log("call ended with cause: " + e.data.cause);
    },
    confirmed: function (e) {
      console.log("call confirmed");
    },
  };

  const options = {
    eventHandlers: eventHandlers,
    mediaConstraints: { audio: true, video: true },
  };

  const session = ua.call("sip:bezoar@sip.antisip.com", options);
  const myVideo = React.useRef();
  const userVideo = React.useRef();
  const [stream, setStream] = React.useState();
  const [input, setInput] = React.useState({
    message: "",
  });

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
        userVideo.current.srcObject = stream;
      });
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  return (
    <div className="Home-Container">
      <h1>Room</h1>
      <div className="Video">
        {stream && (
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{ width: "300px" }}
          />
        )}
        {stream && (
          <video
            playsInline
            muted
            ref={userVideo}
            autoPlay
            style={{ width: "300px" }}
          />
        )}
        <input
          type="text"
          value={input.message}
          onChange={onChange}
          name="message"
        />
        <div style={{ width: "300px" }}>
          <p>{input}</p>
        </div>
      </div>
    </div>
  );
};

export default Room;
