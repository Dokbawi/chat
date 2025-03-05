export interface ChatMessage {
  id: string;
  roomId: string;
  from: string;
  content: string;
  timestamp: Date;
  readBy: string[];
}

export interface ChatReadMessage {
  roomId: string;
  messageId: string;
  readerId: string;
  readAt: Date;
}

export interface ChatRoom {
  _id: string;
  roomId: string;
  participants: string[];
  lastActivity: Date;
  type: 'direct' | 'group';
}
