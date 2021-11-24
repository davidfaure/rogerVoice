import React from "react";
import * as images from "../assets/img/index";

const ChatRoom = ({ name, socket, chatRoom, myId }) => {
  let timeOut = undefined;

  const [messages, setMessages] = React.useState([]);
  const [typing, setTyping] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    socket.on("welcome", (data) => {
      const copy = messages;
      copy.push(data);
      setMessages([...copy]);
    });

    socket.on("isTyping", (data) => {
      console.log("TYPING", data);
      setIsTyping(data.text);
    });
    socket.on("message", (data) => {
      console.log("message from server", data);
      const copy = messages;
      copy.push(data);
      setMessages([...copy]);
    });
  }, []);

  const stopTyping = () => {
    setTyping(false);
    socket.emit("typing", { typing: false });
  };

  const sendMessage = () => {
    if (text !== "") {
      console.log("je suis là", text, name, chatRoom);
      socket.emit("chat", text, name, chatRoom);
      setText("");
    }
  };

  return (
    <div className="Side-Container">
      <div className="Side-Container-Title">
        <h2>Chat Room</h2>
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
                {!message.welcome && (
                  <span>
                    {message.username === name ? "Vous" : message.username}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="Is-Typing-Message">
          <span>{isTyping}</span>
        </div>
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
  );
};

export default ChatRoom;
