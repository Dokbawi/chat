export interface User {
    _id: string;
    userId: string;
    lastSeen: Date;
    isOnline: boolean;
    activeRooms: string[];  
  }