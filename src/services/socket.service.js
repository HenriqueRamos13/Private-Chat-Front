import { io } from "socket.io-client";

class SocketioService {
  socket;
  chat;
  constructor() {}

  setupSocketConnection() {
    this.socket = io("ws://localhost:3000");
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  createChat() {
    this.socket.emit("createChat");
  }

  joinChat(chatId) {
    this.socket.emit("joinChat", chatId);
    this.chat = chatId;
  }

  sendMessage(message) {
    this.socket.emit("sendMessage", message);
  }
}

export default new SocketioService();
