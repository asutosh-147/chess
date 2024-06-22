export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over"
export const RESTART = "restart";
export const JOIN_GAME = "join_game";
export const ADDED_GAME = "added_game";
export const GAME_ALERT = "game_alert";
export const GAME_STARTED = "game_started";
export const AUTO_ABORT = "auto_abort";
export const CREATE_ROOM = "create_room"
export const RESIGN = "resign"
export const DELETE_ROOM = "delete_room"

export type Result = "WHITE_WINS" | "BLACK_WINS" | "DRAW";
export type GameStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED" | "TIME_UP";

export const INIT_PLAYER_TIME = 10 * 60 * 1000;
