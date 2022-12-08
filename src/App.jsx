import React from "react";
import "./App.css";
import { io } from "socket.io-client";
import * as images from "./assets/img/index";
import Dashboard from "./components/Dashboard";
import ChatRoom from "./components/ChatRoom";
import { BASE_API_URL } from "./utils/constants";

const socket = io(BASE_API_URL);
// usually in .env but not used here for test simplicity

function App() {
  const [login, setLogin] = React.useState(false);
  const [myId, setMyId] = React.useState("");
  const [chatRoom, setChatRoom] = React.useState();
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    socket.on("myId", (id, chatRoom) => {
      setMyId(id);
      setChatRoom(chatRoom);
    });
  }, []);

  const joinRoom = () => {
    socket.emit("join", { room: chatRoom, userName: name });
    setLogin(true);
  };

  return (
    <div className="App">
      {login ? (
        <>
          <Dashboard socket={socket} name={name} myId={myId} />
          <ChatRoom
            socket={socket}
            name={name}
            myId={myId}
            chatRoom={chatRoom}
          />
        </>
      ) : (
        <div className="Login">
          <div className="Login-Container">
            <div className="Login-Container-Title">
              <img src={images.logoRogervoice} alt="logo" className="Logo" />
              <h1>Chat Voice App</h1>
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
