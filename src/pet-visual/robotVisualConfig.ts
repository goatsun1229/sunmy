export type RobotExpression =
  | "happy"
  | "calm"
  | "blink"
  | "sleepy"
  | "sleep"
  | "surprised"
  | "confused"
  | "shy"
  | "sad"
  | "celebrate"
  | "angry"
  | "playful"
  | "focused"
  | "worried"
  | "expecting";

export type RobotAction =
  | "idle"
  | "look"
  | "float"
  | "walk"
  | "wave"
  | "click"
  | "celebrate"
  | "yawn"
  | "sleep"
  | "wake"
  | "drinkReminder"
  | "restReminder"
  | "observe"
  | "mouseFollow"
  | "scared"
  | "quiet"
  | "nightPillow"
  | "play";

export const robotManifest = {
  characterId: "companion_robot_01",
  name: "圆舱型陪伴机器人",
  fallbackCharacterId: "classic_pixel",
  canvas: { width: 184, height: 176, anchorX: 92, anchorY: 134 },
  slots: ["head", "face", "neck", "body", "hand", "back", "effect"],
};

export const expressionConfig: Record<RobotExpression, { eye: string; mouth: string; glow: string }> = {
  happy: { eye: "arc", mouth: "smile", glow: "soft" },
  calm: { eye: "dot", mouth: "line", glow: "soft" },
  blink: { eye: "closed", mouth: "line", glow: "soft" },
  sleepy: { eye: "half", mouth: "tiny", glow: "low" },
  sleep: { eye: "sleep", mouth: "none", glow: "low" },
  surprised: { eye: "round", mouth: "o", glow: "bright" },
  confused: { eye: "tilt", mouth: "wave", glow: "soft" },
  shy: { eye: "soft", mouth: "smile", glow: "warm" },
  sad: { eye: "down", mouth: "sad", glow: "low" },
  celebrate: { eye: "star", mouth: "smile", glow: "pulse" },
  angry: { eye: "sharp", mouth: "line", glow: "warm" },
  playful: { eye: "wink", mouth: "smirk", glow: "pulse" },
  focused: { eye: "focus", mouth: "line", glow: "soft" },
  worried: { eye: "wide", mouth: "tiny", glow: "warm" },
  expecting: { eye: "bright", mouth: "smile", glow: "bright" },
};

export const animationConfig: Record<RobotAction, { className: string; fallback: RobotAction }> = {
  idle: { className: "robot-action-idle", fallback: "idle" },
  look: { className: "robot-action-look", fallback: "idle" },
  float: { className: "robot-action-float", fallback: "idle" },
  walk: { className: "robot-action-walk", fallback: "float" },
  wave: { className: "robot-action-wave", fallback: "idle" },
  click: { className: "robot-action-click", fallback: "idle" },
  celebrate: { className: "robot-action-celebrate", fallback: "wave" },
  yawn: { className: "robot-action-yawn", fallback: "sleepy" as RobotAction },
  sleep: { className: "robot-action-sleep", fallback: "idle" },
  wake: { className: "robot-action-wake", fallback: "idle" },
  drinkReminder: { className: "robot-action-drink", fallback: "wave" },
  restReminder: { className: "robot-action-rest", fallback: "wave" },
  observe: { className: "robot-action-observe", fallback: "look" },
  mouseFollow: { className: "robot-action-follow", fallback: "look" },
  scared: { className: "robot-action-scared", fallback: "idle" },
  quiet: { className: "robot-action-quiet", fallback: "idle" },
  nightPillow: { className: "robot-action-pillow", fallback: "sleep" },
  play: { className: "robot-action-play", fallback: "float" },
};

export const accessoryConfig = {
  robot_sleep_cap: { slot: "head", label: "小型睡帽" },
  robot_bowtie: { slot: "neck", label: "简洁领结" },
  robot_star: { slot: "head", label: "头顶小星星" },
  hat_soft_cap: { slot: "head", label: "软软小帽" },
};

