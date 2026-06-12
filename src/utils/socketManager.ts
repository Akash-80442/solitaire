import { io, Socket } from 'socket.io-client';
import { apiService, BASE_URL } from '../services/apiService';

class SocketManager {
  private socket: Socket | null = null;
  private listeners: { [key: string]: Function[] } = {};
  public currentRoomCode: string | null = null;

  async createMatchmakingRoom(ip: string): Promise<string> {
    const roomCode = await apiService.createRoom(ip);
    this.currentRoomCode = roomCode;
    return roomCode;
  }

  async resolveRoomCode(code: string): Promise<string> {
    await apiService.getRoomIp(code); // Throws if invalid
    this.currentRoomCode = code;
    return "server-relay";
  }

  hostGame(onReady: () => void, onClientConnect: () => void, onError: (err: any) => void) {
    this.connectSocket(onReady, onError);
  }

  joinGame(ip: string, onConnect: () => void, onError: (err: any) => void) {
    this.connectSocket(onConnect, onError);
  }

  private connectSocket(onConnect: () => void, onError: (err: any) => void) {
    if (this.socket) {
      if (this.currentRoomCode) {
        this.socket.emit('LEAVE_ROOM', this.currentRoomCode);
      }
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (!this.currentRoomCode) {
      return onError(new Error("No room code set"));
    }

    try {
      this.socket = io(BASE_URL, { transports: ['websocket'] });
      
      this.socket.on('connect', () => {
        this.socket?.emit('JOIN_ROOM', this.currentRoomCode);
        onConnect();
      });

      this.socket.on('GAME_MESSAGE', (payload: any) => {
        if (this.listeners[payload.type]) {
          this.listeners[payload.type].forEach((cb: Function) => cb(payload));
        }
      });

      this.socket.on('connect_error', (err: any) => {
        onError(err);
      });
      
      this.socket.on('disconnect', () => {
        if (this.listeners.DISCONNECT) {
          this.listeners.DISCONNECT.forEach((cb: Function) => cb());
        }
      });

    } catch (e) {
      onError(e);
    }
  }

  // Sends message to the appropriate destination
  send(type: string, payload: any) {
    if (!this.socket || !this.currentRoomCode) return;
    
    const message = { type, ...payload };
    
    // Emit to the server relay, which broadcasts to everyone else in the room
    this.socket.emit('GAME_MESSAGE', {
      roomCode: this.currentRoomCode,
      payload: message
    });
  }

  on(type: string, callback: Function) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  off(type: string, callback: Function) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }

  disconnect() {
    if (this.socket) {
      if (this.currentRoomCode) {
        this.socket.emit('LEAVE_ROOM', this.currentRoomCode);
      }
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentRoomCode = null;
  }
}

export const socketManager = new SocketManager();
