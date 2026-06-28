import { io } from 'socket.io-client';

// Connect to backend server on port 3001
export const socket = io('http://localhost:3001');
