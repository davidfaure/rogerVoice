import React from "react";
import "./App.css";
import { io } from "socket.io-client";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import * as images from "./assets/img/index";
import Dashboard from "./components/Dashboard";
import ChatRoom from "./components/ChatRoom";

const socket = io("http://localhost:8080");

function App() {
  let timeOut = undefined;
  const [login, setLogin] = React.useState(true);
  const [myId, setMyId] = React.useState("");
  const [chatRoom, setChatRoom] = React.useState();
  const [users, setUsers] = React.useState();
  const [name, setName] = React.useState("David Faure");

  React.useEffect(() => {
    socket.on("myId", (id, chatRoom) => {
      setMyId(id);
      setChatRoom(chatRoom);
    });

    // socket.on("welcome", (data) => {
    //   const copy = messages;
    //   copy.push(data);
    //   setMessages([...copy]);
    // });

    socket.on("allUsers", (users) => {
      setUsers(users);
    });

    // socket.on("isTyping", (data) => {
    //   console.log("TYPING", data);
    //   setIsTyping(data.text);
    // });

    // socket.on("stopCall", () => {
    //   console.log("call ended");
    //   setCallEnded(true);
    //   window.location.reload();
    // });

    // socket.on("callUser", (data) => {
    //   setReceivingCall(true);
    //   setCaller(data.from);
    //   setCallerName(data.name);
    //   setCallerSignal(data.signal);
    // });

    // socket.on("message", (data) => {
    //   console.log("message from server", data);
    //   const copy = messages;
    //   copy.push(data);
    //   setMessages([...copy]);
    // });
  }, []);

  const joinRoom = () => {
    socket.emit("join", { room: chatRoom, userName: name });
    setLogin(true);
  };

  // const sendMessage = () => {
  //   if (text !== "") {
  //     socket.emit("chat", text, name, chatRoom);
  //     setText("");
  //   }
  // };

  return (
    <div className="App">
      {login ? (
        <>
          <Dashboard socket={socket} name={name} myId={myId} />
          <ChatRoom socket={socket} name={name} myId={myId} />
        </>
      ) : (
        <div className="Login">
          <div className="Login-Container">
            <div className="Login-Container-Title">
              <img src={images.logoRogervoice} alt="logo" className="Logo" />
              <h1>Rogervoice Test</h1>
            </div>
            <div>
              <p className="Side-Container-Label">Mon nom :</p>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {name && (
                <button onClick={joinRoom} className="Join-Button">
                  Entrer
                </button>
              )}
            </div>
            <div className="Login-Container-Instructions">
              <ul>
                <li>Ouvrez deux onglets et renseignez un nom</li>
                <li>Copiez l&apos;ID d&apos;un des onglets</li>
                <li>Copier l&apos;ID dans l&apos;input ID à appeler</li>
                <li>
                  Cliquer sur le bouton appeler et accepter l'appel sur
                  l&apos;autre onglet
                </li>
                <li>Vous pouvez utiliser le chat si vous voulez.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
