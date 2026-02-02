import { io } from 'socket.io-client';

const getSocketURL = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return "https://hotel-resturant-mangement-system.onrender.com";
  }
  return "http://localhost:5000";
};

const SOCKET_URL = getSocketURL();

let socket = null;

/**
 * POS Socket Singleton
 * - Shared across POS screens
 */
export const getPOSSocket = () => {
  if (!socket) {
    socket = io(`${SOCKET_URL}/pos`, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
};

/**
 * Connect socket safely
 */
export const connectPOSSocket = (token) => {
  const s = getPOSSocket();

  if (!s.connected) {
    s.auth = { token };
    s.connect();
  }

  return s;
};

/**
 * Disconnect socket
 */
export const disconnectPOSSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};