import React from "react";
import JsSIP from "jssip";
import "./Home.css";

const Home = () => {
  // const socket = new JsSIP.WebSocketInterface("wss://sip.antisip.com:4443");
  // socket.via_transport = "tcp";
  // const config = {
  //   sockets: [socket],
  //   uri: "sip:david33@sip.antisip.com",
  //   password: "adminadmin",
  //   stun: "stun.antisip.com",
  //   display_name: "David F",
  //   register: true,
  // };

  const [sessionState, setSessionState] = React.useState({
    uri: "",
    uriToCall: "",
    password: "",
    display_name: "",
  });

  const [callerName, setCallerName] = React.useState("");

  let outgoingSession = null;

  const [stream, setStream] = React.useState();
  const [incomingSession, setIncomingSession] = React.useState();
  const [currentSession, setCurrentSession] = React.useState();
  const [callData, setCallData] = React.useState();
  const [callAccepted, setCallAccepted] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);
  const [registeredError, setRegisteredError] = React.useState(false);
  const [ua, setUserAgent] = React.useState();

  const myVideo = React.useRef();
  const myAudio = React.useRef();
  const userVideo = React.useRef();

  React.useEffect(() => {
    if (registeredError) {
      setTimeout(() => {
        setRegisteredError(false);
      }, 2000);
    }
  }, [registeredError]);

  const initialize = () => {
    const socket = new JsSIP.WebSocketInterface("wss://sip.antisip.com:4443");
    socket.via_transport = "tcp";
    const config = {
      sockets: [socket],
      uri: sessionState.uri,
      password: sessionState.password,
      stun: "stun.antisip.com",
      display_name: sessionState.display_name,
    };

    const userAgent = new JsSIP.UA(config);

    userAgent.on("registered", (data) => {
      console.info(
        "registered: ",
        data.response.status_code,
        ",",
        data.response.reason_phrase
      );
      setRegistered(true);
    });

    userAgent.on("registrationFailed", (data) => {
      console.log("registrationFailed, ", data);
      setRegisteredError(true);
    });

    userAgent.on("registrationExpiring", () => {
      console.warn("registrationExpiring");
    });

    userAgent.on("newRTCSession", (data) => {
      console.info("onNewRTCSession: ", data);
      setCallData(data);
      if (data.originator === "remote") {
        //incoming call
        console.info("incomingSession, answer the call");
        console.log("NAME", data.request.from.display_name);
        setCallerName(data.request.from.display_name);
        setIncomingSession(data.session);
        //Answer the incoming conversation. This method only applies to incoming sessions.
        // data.session.answer({
        //   mediaConstraints: { audio: true, video: true },
        //   // 'mediaStream': localStream
        // });
      } else {
        console.info("outgoingSession");
        outgoingSession = data.session;
        outgoingSession.on("connecting", (data) => {
          console.info("onConnecting - ", data.request);
          setCurrentSession(outgoingSession);
          outgoingSession = null;
        });
      }

      //Fired when accepting a call
      data.session.on("accepted", (data) => {
        console.info("onAccepted - ", data);
        if (data.originator === "remote" && currentSession === null) {
          setCurrentSession(incomingSession);
          setIncomingSession(null);
          console.info("setCurrentSession - ", currentSession);
        }
      });
      //Fire after confirming the call
      data.session.on("confirmed", (data) => {
        console.info("onConfirmed - ", data);
        if (data.originator === "remote" && currentSession === null) {
          setCurrentSession(incomingSession);
          setIncomingSession(null);
          console.info("setCurrentSession - ", currentSession);
        }
        setCallAccepted(true);
      });
      data.session.on("sdp", (data) => {
        // console.info("onSDP, type - ", data.type, " sdp - ", data.sdp);
        //data.sdp = data.sdp.replace('UDP/TLS/RTP/SAVPF', 'RTP/SAVPF');
        //console.info('onSDP, changed sdp - ', data.sdp);
      });
      //Fired when receiving or generating a 1XX SIP response (>100) to an invitation request. This event is triggered before SDP processing (if it exists), so that it can be fine-tuned when needed, or even deleted by deleting the body of the response parameter in the data object
      data.session.on("progress", function (data) {
        console.info("onProgress - ", data.originator);
        if (data.originator === "remote") {
          console.info("onProgress, response - ", data.response);
        }
      });
      //Fire after creating a basic RTCPeerConnection. The application has the opportunity to change the peerconnection by adding RTCDataChannel or setting the corresponding event listener on the peerconnection.
      data.session.on("peerconnection", (data) => {
        console.info("onPeerconnection - ", data.peerconnection);
        data.peerconnection.onaddstream = (ev) => {
          console.info("onaddstream from remote - ", ev);
          // myAudio.src = URL.createObjectURL(ev.stream);
          // myAudio.current.srcObject = ev.stream;
          userVideo.current.srcObject = ev.stream;
          // userVideo.onloadstart = () => {
          //   userVideo.play();
          // };

          const interval = setInterval(() => {
            if (!userVideo.videoWidth) {
              return;
            }
            //stage.appendChild(videoView);
            clearInterval(interval);
          }, 1000 / 50);
          // myAudio.onloadstart = () => {
          //   myAudio.play();
          // };
        };
      });
      userAgent.on("newMessage", (data) => {
        if (data.originator === "local") {
          console.info("onNewMessage , OutgoingRequest - ", data.request);
        } else {
          console.info("onNewMessage , IncomingRequest - ", data.request);
        }
      });
      console.info("call register");
    });
    userAgent.start();
    setUserAgent(userAgent);
  };

  React.useEffect(() => {
    if (registered) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then(function success(stream) {
          myVideo.current.srcObject = stream;
          // document.body.addEventListener("click", function () {
          //   myVideo.play();
          // });
          // myVideo.play();
          // wait until the video stream is ready
          const interval = setInterval(() => {
            if (!myVideo.videoWidth) {
              return;
            }
            //stage.appendChild(videoView);
            clearInterval(interval);
          }, 1000 / 50);
        })
        .catch((error) => {
          console.log(error.name, error.message);
        });
    }
  }, [registered]);

  const eventHandlers = {
    progress: function (e) {
      console.log("call is in progress");
    },
    failed: function (e) {
      console.log("call failed: ", e);
    },
    ended: function (e) {
      console.log("call ended : ", e);
    },
    confirmed: function (e) {
      console.log("call confirmed");
    },
  };

  const options = {
    mediaConstraints: {
      audio: true,
      video: true,
    },
    eventHandlers: eventHandlers,
  };
  const [session, setSession] = React.useState();

  const connectToCall = () => {
    outgoingSession = ua.call(sessionState.uriToCall, options);
  };

  const endCall = () => {
    ua.stop();
    window.location.reload();
  };

  const answerCall = () => {
    callData.session.answer({
      mediaConstraints: { audio: true, video: true },
      // mediaStream: localStream,
    });
    setCallAccepted(true);
    callData.session.connection.addEventListener("addstream", (event) => {
      console.log("DEBUG: addstream............");
    });
  };

  console.log(callAccepted, "call");

  const onChange = (e) => {
    const { name, value } = e.target;
    setSessionState({ ...sessionState, [name]: value });
  };
  return (
    <div className="Home-Container">
      <h1>Home</h1>
      <div className="Home-Container-Header">
        <label htmlForm="uriToCall">URI to call :</label>
        <input
          type="text"
          name="uriToCall"
          value={sessionState.uriToCall}
          onChange={onChange}
        />
        <button onClick={connectToCall}>Make a Call </button>
      </div>
      <div className="Video-Frame-Container">
        <div className="Video-Frame-User">
          <video playsInline ref={myVideo} muted autoPlay />
        </div>

        <div className="Video-Frame-Remote">
          <video playsInline ref={userVideo} muted autoPlay />
        </div>
      </div>
      <div className="Footer-Container">
        {callAccepted && <button onClick={endCall}>End Call</button>}
      </div>
      {incomingSession && !callAccepted && (
        <>
          <h1>{callerName} vous appelle !</h1>
          <button onClick={answerCall}>Answer call</button>
        </>
      )}
      {!registered && (
        <div className="Register-Container-Background">
          {registeredError && (
            <div className="Registration-Failed">
              <p>Registration failed, password is adminadmin</p>
            </div>
          )}
          <div className="Register-Container-Blur" />
          <div className="Register-Container">
            <h1>Welcome to my rogervoice test</h1>
            <h2>In order to make a call please do the following step :</h2>
            <div>
              <ul>
                <li>
                  Open a new tab on your browser with the same url:
                  (http://localhost:3000)
                </li>
                <li>
                  Fill the <b>first</b> tab with :
                  <ul>
                    <li>
                      <b>URI</b> : sip:david33@sip.antisip.com
                    </li>
                    <li>
                      <b>password:</b> adminadmin (I know it's simple but
                      efficient)
                    </li>
                    <li>
                      <b>display_name:</b> 'Your choice'
                    </li>
                  </ul>
                </li>
                <li>
                  Fill the <b>second</b> tab with :
                  <ul>
                    <li>
                      <b>URI</b> : sip:damien33@sip.antisip.com
                    </li>
                    <li>
                      <b>password:</b> adminadmin (I know it's simple but
                      efficient)
                    </li>
                    <li>
                      <b>display_name:</b> 'Your choice'
                    </li>
                  </ul>
                </li>
                <li>
                  On one tab fill the URI to Call input with the URI of the
                  other tab. <br />
                  <span style={{ fontStyle: "italic", fontSize: "12px" }}>
                    Ex: if you're on the david (sip:david33@sip.antisip.com) tab
                    fill the input with damien uri :
                    sip:damien33@sip.antisip.com
                  </span>
                </li>
                <li>
                  Go the the other tab, accept the call and enjoy your
                  conversation
                </li>
              </ul>
            </div>
            <div className="Registration-Form-Container">
              <h1>Registration </h1>
              <label htmlFor="">URI :</label>
              <input
                type="text"
                name="uri"
                value={sessionState.uri}
                onChange={onChange}
              />
              <label>Name :</label>
              <input
                type="text"
                name="display_name"
                value={sessionState.display_name}
                onChange={onChange}
              />
              <label>Password :</label>
              <input
                type="password"
                name="password"
                value={sessionState.password}
                onChange={onChange}
              />
              <button onClick={initialize}>Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
