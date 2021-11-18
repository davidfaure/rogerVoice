import JsSIP from "jssip";

const socket = new JsSIP.WebSocketInterface("wss://sip.myhost.com");
const config = {
  sockets: [socket],
  uri: "sip:azwell@sip.antisip.com",
  password: "adminadmin",
};
