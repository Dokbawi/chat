import { Message } from "./message.interface";

export interface ServerToClientEvents {
    newMessage: (message: Message) => void;
    streamMessage: (message: Message) => void;
    error: (error: { message: string }) => void;
  }
  
  export interface ClientToServerEvents {
    sendMessage: (message: Message) => void;
    startStreaming: (message: Message) => void;
  }