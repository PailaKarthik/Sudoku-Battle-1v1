export const SOCKET_EVENTS = {
  CONNECTION_READY: "connection.ready",

  PRESENCE_STATUS: "presence.status",

  MATCHMAKING_QUEUED: "matchmaking.queued",

  MATCHMAKING_MATCHED: "matchmaking.matched",

  MATCHMAKING_CANCELLED: "matchmaking.cancelled",

  BATTLE_INVITE_RECEIVED: "battle.invite.received",

  BATTLE_INVITE_UPDATED: "battle.invite.updated",

  BATTLE_JOINED: "battle.joined",

  BATTLE_PLAYER_JOINED: "battle.player.joined",

  BATTLE_COUNTDOWN: "battle.countdown",

  BATTLE_COUNTDOWN_CANCELLED: "battle.countdown.cancelled",

  BATTLE_STARTED: "battle.started",

  BATTLE_MOVE: "battle.move",

  BATTLE_MOVE_RESULT: "battle.move.result",

  BATTLE_FINISHED: "battle.finished",

  BATTLE_START_FAILED: "battle.start.failed",
} as const;
