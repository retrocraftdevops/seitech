import { Server } from 'socket.io';
import type { NextApiRequest } from 'next';
import { NextApiResponseWithSocket, initializeSocketIO } from '@/lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    const io = initializeSocketIO(res.socket.server);
    res.socket.server.io = io;
  } else {
    console.log('Socket.IO server already initialized');
  }

  res.end();
}
