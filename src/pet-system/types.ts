export type PersonalityKey = "active" | "quiet" | "clingy" | "independent" | "playful" | "caring";
export type MemoryType =
  | "first_meet"
  | "rename"
  | "first_reminder"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "late_night"
  | "active_10h"
  | "active_100h"
  | "special_action"
  | "special_item"
  | "birthday"
  | "anniversary"
  | "festival";

export type ItemType = "hat" | "accessory" | "badge" | "expression" | "action" | "room" | "keepsake";
export type EntitlementKind = "free" | "premiumLifetime" | "seasonPass" | "cosmeticItem" | "characterPack" | "eventPack";

export type PetProfile = {
  petId: string;
  petName: string;
  ownerName: string;
  createdAt: string;
  firstMeetDate: string;
  lastActiveAt: string;
  totalActiveMinutes: number;
  totalActiveDays: number;
  consecutiveActiveDays: number;
  currentVersion: string;
  dataSchemaVersion: number;
};

export type Relationship = {
  familiarity: number;
  trust: number;
  bond: number;
  interactionCount: number;
  completedReminderCount: number;
  ignoredReminderCount: number;
  sharedMemoryCount: number;
  dailyGrowth: Record<string, number>;
};

export type GentleState = {
  energy: number;
  mood: number;
  curiosity: number;
  security: number;
  roomComfort: number;
  dailyMoodLabel: string;
  dailyMoodDate: string;
};

export type DailyLoop = {
  date: string;
  greeted: boolean;
  status: string;
  taskId: string;
  taskLabel: string;
  taskCompleted: boolean;
  summary?: string;
  minutes: number;
  reminderCompletions: number;
  interactions: number;
};

export type Memory = {
  memoryId: string;
  type: MemoryType;
  title: string;
  description: string;
  createdAt: string;
  relatedStats: Record<string, string | number | boolean>;
  image?: string;
  hidden: boolean;
  viewed: boolean;
};

export type Collectible = {
  itemId: string;
  itemType: ItemType;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "limited";
  assetPath: string;
  unlockType: string;
  unlockCondition: string;
  price: number;
  currencyType: "free" | "coin" | "premium";
  entitlementId?: string;
  isLimited: boolean;
  startDate?: string;
  endDate?: string;
  owned: boolean;
  equipped: boolean;
};

export type Achievement = {
  achievementId: string;
  title: string;
  description: string;
  hidden: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
  rewardItemId?: string;
  memoryId?: string;
};

export type Stats = {
  firstLaunchAt: string;
  totalUseDays: number;
  consecutiveUseDays: number;
  totalCompanionMinutes: number;
  dailyCompanionMinutes: Record<string, number>;
  interactionCount: number;
  reminderShownCount: number;
  reminderCompletedCount: number;
  reminderIgnoredCount: number;
  randomEventTriggerCount: number;
  memoryUnlockCount: number;
  achievementUnlockCount: number;
  collectibleOwnedCount: number;
  equippedItemIds: string[];
  day1Completed: boolean;
  day3Completed: boolean;
  day7Completed: boolean;
};

export type Entitlement = {
  entitlementId: string;
  kind: EntitlementKind;
  source: "free" | "mock" | "license" | "purchase";
  grantedAt: string;
  expiresAt?: string;
  signature: string;
};

export type QuietMode = {
  enabled: boolean;
  until?: number;
  fullscreenAuto: boolean;
  appKeywords: string[];
};

export type CompanionData = {
  schemaVersion: number;
  profile: PetProfile;
  relationship: Relationship;
  personality: Record<PersonalityKey, number>;
  state: GentleState;
  daily: DailyLoop;
  memories: Memory[];
  collectibles: Collectible[];
  achievements: Achievement[];
  stats: Stats;
  entitlements: Entitlement[];
  eventLog: Record<string, { lastTriggeredAt: string; dailyCount: Record<string, number> }>;
  claimedActivityRewards: Record<string, string>;
  quietMode: QuietMode;
};

export type RandomEventConfig = {
  eventId: string;
  name: string;
  triggerConditions: string[];
  probability: number;
  cooldownMinutes: number;
  maxDailyTriggers: number;
  requiredRelationship?: Partial<Pick<Relationship, "familiarity" | "trust" | "bond">>;
  requiredPersonality?: Partial<Record<PersonalityKey, number>>;
  animationKey: string;
  dialogueKey: string;
  reward?: { bond?: number; familiarity?: number; itemId?: string };
  memoryTrigger?: MemoryType;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
};

