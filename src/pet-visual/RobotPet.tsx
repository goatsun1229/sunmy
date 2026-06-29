import type { RobotAction, RobotExpression } from "./robotVisualConfig";
import { accessoryConfig, animationConfig, expressionConfig } from "./robotVisualConfig";

type RobotPetProps = {
  action: RobotAction;
  expression: RobotExpression;
  equippedItemIds: string[];
  quiet: boolean;
  edgePose?: "left" | "right" | "top" | "bottom" | null;
};

export function RobotPet({ action, expression, equippedItemIds, quiet, edgePose }: RobotPetProps) {
  const animation = animationConfig[action] || animationConfig.idle;
  const expressionMeta = expressionConfig[expression] || expressionConfig.calm;
  const equipped = new Set(equippedItemIds);
  return (
    <svg className={`robot-pet ${animation.className} expression-${expression} glow-${expressionMeta.glow} ${quiet ? "robot-quiet" : ""} ${edgePose ? `robot-edge-${edgePose}` : ""}`} viewBox="0 0 184 176" aria-hidden="true">
      <defs>
        <linearGradient id="robot-shell" x1="26" y1="20" x2="148" y2="156" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbffff" />
          <stop offset="0.48" stopColor="#dff7ff" />
          <stop offset="1" stopColor="#9ecddd" />
        </linearGradient>
        <linearGradient id="robot-mask" x1="58" y1="42" x2="126" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#07131f" />
          <stop offset="1" stopColor="#14324a" />
        </linearGradient>
        <radialGradient id="robot-core" cx="50%" cy="50%" r="60%">
          <stop stopColor="#f4ffff" />
          <stop offset="0.42" stopColor="#54e5ff" />
          <stop offset="1" stopColor="#1689b7" />
        </radialGradient>
        <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse className="robot-shadow" cx="92" cy="154" rx="48" ry="10" />
      <g className="robot-body">
        <path className="robot-back-fin" d="M39 105 C24 98 18 84 24 72 C37 75 45 84 48 99 Z" />
        <path className="robot-back-fin right" d="M145 105 C160 98 166 84 160 72 C147 75 139 84 136 99 Z" />
        <path className="robot-arm left" d="M49 101 C31 100 26 114 35 125 C45 136 58 126 56 112" />
        <path className="robot-arm right" d="M135 101 C153 100 158 114 149 125 C139 136 126 126 128 112" />
        <circle className="robot-hand left" cx="35" cy="124" r="9" />
        <circle className="robot-hand right" cx="149" cy="124" r="9" />
        <path className="robot-shell" d="M36 103 C36 72 58 55 92 55 C126 55 148 72 148 103 C148 136 124 151 92 151 C60 151 36 136 36 103 Z" />
        <path className="robot-belly-line" d="M53 104 C68 116 116 116 131 104" />
        <path className="robot-light-strip" d="M51 91 C68 80 116 80 133 91" />
        <path className="robot-core-drop" d="M92 105 C105 118 101 135 92 139 C83 135 79 118 92 105 Z" filter="url(#soft-glow)" />
        <circle className="robot-status-dot left" cx="50" cy="95" r="4" />
        <circle className="robot-status-dot right" cx="134" cy="95" r="4" />
      </g>

      <g className="robot-head">
        <path className="robot-halo" d="M75 19 C81 11 103 11 109 19" />
        <circle className="robot-antenna" cx="92" cy="18" r="4" />
        <path className="robot-sensor-wing left" d="M56 55 C45 47 43 35 51 28 C60 34 64 44 63 55 Z" />
        <path className="robot-sensor-wing right" d="M128 55 C139 47 141 35 133 28 C124 34 120 44 121 55 Z" />
        <path className="robot-helmet" d="M58 61 C58 34 72 23 92 23 C112 23 126 34 126 61 C126 78 112 89 92 89 C72 89 58 78 58 61 Z" />
        <path className="robot-mask" d="M67 57 C67 43 76 36 92 36 C108 36 117 43 117 57 C117 70 108 76 92 76 C76 76 67 70 67 57 Z" />
        <g className={`robot-face face-eye-${expressionMeta.eye} face-mouth-${expressionMeta.mouth}`}>
          <path className="robot-eye left" d="M77 56 C82 52 87 52 91 56" />
          <path className="robot-eye right" d="M93 56 C98 52 104 52 108 56" />
          <path className="robot-mouth" d="M84 66 C89 69 96 69 101 66" />
          <circle className="robot-star left" cx="83" cy="54" r="2" />
          <circle className="robot-star right" cx="101" cy="54" r="2" />
        </g>
      </g>

      {equipped.has("robot_sleep_cap") && <path className="robot-accessory sleep-cap" d="M66 33 C76 15 107 14 119 34 C103 29 82 29 66 33 Z" />}
      {(equipped.has("robot_bowtie") || equipped.has("badge_first_meet")) && <path className="robot-accessory bowtie" d="M82 91 L92 97 L102 91 L102 103 L92 98 L82 103 Z" />}
      {(equipped.has("robot_star") || equipped.has("hat_soft_cap")) && <path className="robot-accessory top-star" d="M92 4 L95 12 L104 12 L97 17 L100 26 L92 20 L84 26 L87 17 L80 12 L89 12 Z" />}
      {action === "nightPillow" || expression === "sleep" ? <path className="robot-sleep-visor" d="M53 47 C64 24 120 24 131 47 C122 31 62 31 53 47 Z" /> : null}
    </svg>
  );
}

export function expressionForState(state: string, tick: number): RobotExpression {
  if (tick % 24 === 0) return "blink";
  if (state === "sleep") return "sleep";
  if (state === "success") return "celebrate";
  if (state === "error") return "worried";
  if (state === "debug") return "confused";
  if (state === "watching") return "expecting";
  if (state === "writing" || state === "coding") return "focused";
  if (state === "coffee") return "calm";
  if (state === "charge") return "happy";
  return "happy";
}

export function actionForState(state: string): RobotAction {
  if (state === "sleep") return "sleep";
  if (state === "success") return "celebrate";
  if (state === "error") return "scared";
  if (state === "watching") return "observe";
  if (state === "writing" || state === "coding") return "quiet";
  if (state === "coffee") return "drinkReminder";
  if (state === "charge") return "float";
  return "idle";
}
