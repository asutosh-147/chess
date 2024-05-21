import { randomUUID } from "crypto";
import { WebSocket } from "ws";

export class User {
  public id: string;
  public userId: string;
  public socket: WebSocket;

  constructor(userId: string, socket: WebSocket) {
    this.id = randomUUID();
    this.userId = userId;
    this.socket = socket;
  }
}

export class SocketManager {
  public static socketInstance: SocketManager;
  private interestedInRoom: Map<string, User[]>;
  private userRoomMapping: Map<string, string>;
  private constructor() {
    this.interestedInRoom = new Map<string, User[]>();
    this.userRoomMapping = new Map<string, string>();
  }
  static getInstance() {
    if (this.socketInstance) {
      return this.socketInstance;
    }
    this.socketInstance = new SocketManager();
    return this.socketInstance;
  }
  addUserToMapping(roomId: string, user: User) {
    this.interestedInRoom.set(roomId, [
      ...(this.interestedInRoom.get(roomId) || []),
      user,
    ]);
    this.userRoomMapping.set(user.userId, roomId);
  }

  broadcastMessage(roomId: string, message: string) {
    const users = this.interestedInRoom.get(roomId);
    if (!users) {
      console.error("No users in room");
      return;
    }
    users.forEach((user) => user.socket.send(message));
  }

  broadCastMessageToOthers(roomId:string,userId:string,message:string){
    const users = this.interestedInRoom.get(roomId);
    if(!users){
      console.error("No users in room");
      return;
    }
    users.forEach((user) => {
      if(user.userId !== userId){
        user.socket.send(message);
      }
    })
  }
  removeUser(userId: string) {
    if(userId === ''){
      console.log("Empty user id")
      return;
    }
    const roomId = this.userRoomMapping.get(userId);
    if (!roomId) {
      console.error("No room found for user");
      return;
    }
    const users = this.interestedInRoom.get(roomId) || [];
    const remainingUsers = users.filter((user) => user.userId !== userId);
    this.interestedInRoom.set(roomId,remainingUsers);
    if(this.interestedInRoom.get(roomId)?.length === 0){
      this.interestedInRoom.delete(roomId);
    }
    this.userRoomMapping.delete(userId);
    console.log("User removed successfully")
  }
}
