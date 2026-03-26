import { getToken } from "../utils/storage";
import { io } from "socket.io-client";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: getToken(),
  },
});
