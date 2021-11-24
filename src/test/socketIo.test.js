const io = require("socket.io-client");
const http = require("http");
const ioBack = require("socket.io");

let socket;
let httpServer;
let httpServerAddr;
let ioServer;

beforeAll(async (done) => {
  httpServer = await http.createServer().listen();
  httpServerAddr = await httpServer.address();
  ioServer = ioBack(httpServer);
  done();
});

afterAll((done) => {
  ioServer.close();
  httpServer.close();
  done();
});

beforeEach((done) => {
  socket = io.connect(
    `http://[${httpServerAddr.address}]:${httpServerAddr.port}`,
    {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
    }
  );
  socket.on("connect", () => {
    done();
  });
});

afterEach((done) => {
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});

describe("socket io connection", () => {
  test("should communicate", (done) => {
    // once connected, emit Hello World
    ioServer.emit("myId", "id", "chatroom");
    socket.once("myId", (id) => {
      // Check that id exist
      expect(id).toBeDefined();
      done();
    });
    ioServer.on("connection", (mySocket) => {
      expect(mySocket).toBeDefined();
    });
  });
  test("should send message to user when joining a room", (done) => {
    ioServer.emit("welcome", {
      id: "testId",
      username: "David",
      text: "Bienvenue David",
      welcome: true,
    });
    socket.once("welcome", (data) => {
      expect(data.id).toBeDefined();
      expect(data.username).toBe("David");
      expect(data.text).toBe("Bienvenue David");
      expect(data.welcome).toBeTruthy();
      done();
    });
  });
  test("should send isTyping message info when typing", (done) => {
    ioServer.emit("isTyping", {
      typing: "Bonjour à tous",
      name: "David",
    });
    socket.once("isTyping", (data) => {
      expect(data.typing).toBeTruthy();
      expect(data.typing).toBe("Bonjour à tous");
      expect(data.name).toBe("David");
      done();
    });
  });
  test("should send an empty isTyping message info when not typing", (done) => {
    ioServer.emit("isTyping", {
      typing: false,
    });
    socket.once("isTyping", (data) => {
      expect(data.typing).toBeFalsy();
      expect(data.name).toBeUndefined();
      done();
    });
  });
  test("should send a message to all user when message sent", (done) => {
    ioServer.emit("message", {
      id: "testId",
      username: "David",
      text: "Bonjour à tous",
      welcome: false,
    });
    socket.once("message", (data) => {
      expect(data.id).toBeDefined();
      expect(data.username).toBeDefined();
      expect(data.username).toBe("David");
      expect(data.text).toBeDefined();
      expect(data.text).toBe("Bonjour à tous");
      expect(data.welcome).toBeFalsy();
      done();
    });
  });
});
