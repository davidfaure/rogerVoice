import { io } from "socket.io-client";

// const BASE_URL = "http://localhost:8080";

const socket = io("http://localhost:8080");

export default socket;

export function socketInit() {}
