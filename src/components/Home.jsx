import React from "react";
import JsSIP from "jssip";

const Home = () => {
  const socket = new JsSIP.WebSocketInterface("wss://sip.antisip.com:4443");
  socket.via_transport = "tcp";
  const config = {
    sockets: [socket],
    uri: "sip:david33@sip.antisip.com",
    password: "adminadmin",
    stun: "stun.antisip.com",
    display_name: "David F",
  };

  const [sessionState, setSessionState] = React.useState({
    callSession: "",
    from: "",
  });

  const myVideo = React.useRef();
  const myAudio = React.useRef();
  const userVideo = React.useRef();

  const ua = new JsSIP.UA(config);
  ua.on("connected", (data) => {
    console.log("USER Connected", data);
  });

  ua.on("newRTCSession", (e) => {
    // console.log(e.session, "session dans ON");
    const session = e.session;
    session.on("confirmed", () => {
      console.log(session, "session");
      const localStream = session.connection.getLocalStreams()[0];
      myVideo.current.srcObject = localStream;
      userVideo.current.srcObject = localStream;
    });

    session.on("failed", () => {
      console.log("call failed");
    });

    session.on("ended", () => {
      console.log("call ended");
    });

    session.on("addstream", (e) => {
      const remoteStream = session.connection.getRemoteStreams();
      console.log(remoteStream, "remote");
    });
    session.on("");
    // setSessionState({
    //   ...sessionState,
    //   callSession: e.session,
    // });
  });

  const options = {
    mediaConstraints: {
      audio: true,
      video: true,
    },
  };
  const [session, setSession] = React.useState();

  const connectToCall = () => {
    setSession(ua.call("sip:bezoar@sip.antisip.com", options));
  };

  React.useEffect(() => {
    ua.start();
    // bezoar.start();
  }, []);

  // console.log(session, "session POUR VOIR");

  return (
    <div className="Home-Container">
      <h1>Home</h1>
      <button onClick={connectToCall}>Make a Call </button>
      <video playsInline ref={myVideo} autoPlay style={{ width: "300px" }} />
      <audio controls ref={myAudio} />
      {/* {session && (
        <>
          {" "}
          <div> Moi : {session.local_identity.display_name}</div>
          <div> J'appelle : {session.remote_identity.uri.user}</div>
          <video
            playsInline
            ref={myVideo}
            autoPlay
            style={{ width: "300px" }}
          />
          <video
            playsInline
            ref={userVideo}
            autoPlay
            style={{ width: "300px" }}
          />
          <audio autoPlay id="audioElement" />
        </>
      )} */}

      {/* <button onClick={CallIt}>Call</button> */}
    </div>
  );
};

export default Home;
