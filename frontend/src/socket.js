import { io } from 'socket.io-client';

// Connect to backend server using environment variable or fallback to localhost
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
export const socket = io(backendUrl);
