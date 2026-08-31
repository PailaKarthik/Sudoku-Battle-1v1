import { io, type Socket } from "socket.io-client";

import { getAccessToken } from "../api/cleint";

function getSocketUrl(): string {
  const configured = process.env.EXPO_PUBLIC_SOCKET_URL;

  if (configured && configured.trim().length > 0) {
    return configured.trim().replace(/\/+$/, "");
  }

  /*
   * IMPORTANT:
   *
   * localhost works only when the client
   * itself is running on the same machine
   * as the backend.
   *
   * For a physical Android device, use
   * your PC's LAN IP via EXPO_PUBLIC_SOCKET_URL.
   */
  return "http://localhost:3000";
}

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

let connectionPromise: Promise<Socket> | null = null;

export async function connectSocket(): Promise<Socket> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("Authentication required.");
  }

  /*
   * Already connected.
   */
  if (socket?.connected) {
    return socket;
  }

  /*
   * Another part of the app is already
   * establishing the connection.
   */
  if (connectionPromise) {
    return connectionPromise;
  }

  /*
   * Reuse an existing disconnected socket.
   */
  if (!socket) {
    socket = io(`${SOCKET_URL}/battle`, {
      transports: ["websocket"],

      auth: {
        token,
      },

      autoConnect: true,

      reconnection: true,

      reconnectionAttempts: Infinity,

      reconnectionDelay: 1000,

      reconnectionDelayMax: 5000,

      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("[Battle Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Battle Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("[Battle Socket] Connection error:", error.message);
    });
  }

  const current = socket;

  connectionPromise = new Promise<Socket>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      current.off("connect", handleConnect);

      current.off("connect_error", handleError);
    };

    const handleConnect = () => {
      if (settled) {
        return;
      }

      settled = true;

      cleanup();

      resolve(current);
    };

    const handleError = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;

      cleanup();

      reject(error);
    };

    /*
     * If Socket.IO was already connected
     * between the checks above, resolve
     * immediately.
     */
    if (current.connected) {
      handleConnect();

      return;
    }

    current.once("connect", handleConnect);

    current.once("connect_error", handleError);
  });

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  connectionPromise = null;

  if (!socket) {
    return;
  }

  socket.disconnect();

  socket = null;
}

export async function joinMatchmaking(variant: "2x3" | "3x3"): Promise<void> {
  const current = await connectSocket();

  current.emit("matchmaking.join", {
    variant,
  });
}

export async function leaveMatchmaking(variant: "2x3" | "3x3"): Promise<void> {
  const current = await connectSocket();

  current.emit("matchmaking.leave", {
    variant,
  });
}

export async function joinBattle(battleId: string): Promise<void> {
  const current = await connectSocket();

  current.emit("battle.join", {
    battleId,
  });
}

export async function sendBattleMove(
  battleId: string,
  row: number,
  column: number,
  value: number,
): Promise<void> {
  const current = await connectSocket();

  current.emit("battle.move", {
    battleId,
    row,
    column,
    value,
  });
}

export async function checkPresence(userId: string): Promise<boolean> {
  const current = await connectSocket();

  return new Promise<boolean>((resolve) => {
    let settled = false;

    let timeout: ReturnType<typeof setTimeout>;

    const finish = (online: boolean) => {
      if (settled) {
        return;
      }

      settled = true;

      clearTimeout(timeout);

      current.off("presence.status", handler);

      resolve(online);
    };

    const handler = (data: { userId: string; online: boolean }) => {
      if (data?.userId !== userId) {
        return;
      }

      finish(data.online);
    };

    current.on("presence.status", handler);

    current.emit("presence.check", {
      userId,
    });

    timeout = setTimeout(() => {
      finish(false);
    }, 5000);
  });
}
