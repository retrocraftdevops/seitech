// Server-side socket.io imports - only used in API routes
// This file should only be imported in server-side code
import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';

// Conditional import for socket.io (server-only)
type SocketIOServer = any; // Type will be resolved at runtime in API routes

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer | undefined;

export const initializeSocketIO = (server: HTTPServer): SocketIOServer => {
  // Dynamic import for server-side only
  if (typeof window === 'undefined' && !io) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Server: SocketIOServer } = require('socket.io');
    io = new SocketIOServer(server, {
      path: '/api/socket',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket: any) => {
      console.log('Client connected:', socket.id);

      // Subscribe to rooms
      socket.on('subscribe', ({ room }: { room: string }) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      });

      // Unsubscribe from rooms
      socket.on('unsubscribe', ({ room }: { room: string }) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    console.log('Socket.IO server initialized');
  }

  return io;
};

export const getSocketIO = (): SocketIOServer | undefined => {
  return io;
};

// Event emitters for Social Learning features
export const emitDiscussionUpvote = (
  discussionId: number,
  count: number
) => {
  if (io) {
    io.emit('discussion:upvote', {
      type: 'discussion',
      id: discussionId,
      count,
    });
  }
};

export const emitDiscussionReply = (
  discussionId: number,
  reply: any
) => {
  if (io) {
    io.emit('discussion:reply', {
      discussion_id: discussionId,
      reply,
    });
  }
};

export const emitDiscussionView = (
  discussionId: number,
  count: number
) => {
  if (io) {
    io.emit('discussion:view', {
      discussion_id: discussionId,
      count,
    });
  }
};

export const emitStudyGroupJoin = (
  groupId: number,
  userName: string,
  memberCount: number
) => {
  if (io) {
    io.emit('study-group:join', {
      group_id: groupId,
      user_name: userName,
      member_count: memberCount,
    });
  }
};

export const emitStreakMilestone = (
  userId: number,
  milestone: number,
  badge: string
) => {
  if (io) {
    io.emit('streak:milestone', {
      user_id: userId,
      milestone,
      badge,
    });
  }
};

export const emitLeaderboardUpdate = (
  category: string,
  period: string
) => {
  if (io) {
    io.emit('leaderboard:update', {
      category,
      period,
    });
  }
};

export const emitNotification = (
  userId: number,
  notification: {
    type: string;
    title: string;
    message: string;
    link?: string;
    data?: any;
  }
) => {
  if (io) {
    // Emit to specific user's room
    io.to(`user:${userId}`).emit('notification', notification);
    
    // Also emit to general notifications room for the user
    io.emit('notification', {
      ...notification,
      user_id: userId,
    });
  }
};
