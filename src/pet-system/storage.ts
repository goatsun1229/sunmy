import { achievementTemplates, APP_VERSION, dailyStatusLabels, dailyTasks, SCHEMA_VERSION, starterCollectibles } from "./config";
import type { CompanionData, Memory, PersonalityKey } from "./types";

const STORAGE_KEY = "pixelpal.companion.v1";
const BACKUP_KEY = "pixelpal.companion.backup";

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const start = new Date(a.slice(0, 10)).getTime();
  const end = new Date(b.slice(0, 10)).getTime();
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function safeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function buildFirstMemory(now: string, petName: string, ownerName: string): Memory {
  return {
    memoryId: "memory_first_meet",
    type: "first_meet",
    title: "第一次见面",
    description: `${ownerName} 和 ${petName} 第一次在桌面见面。它不会因为离开而受惩罚，只会温和地等你回来。`,
    createdAt: now,
    relatedStats: { petName, ownerName },
    image: "placeholder:first_meet",
    hidden: false,
    viewed: false,
  };
}

export function createDefaultCompanion(petName = "小码", ownerName = "主人"): CompanionData {
  const now = new Date().toISOString();
  const today = todayKey();
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      petId: safeId("pet"),
      petName,
      ownerName,
      createdAt: now,
      firstMeetDate: now,
      lastActiveAt: now,
      totalActiveMinutes: 0,
      totalActiveDays: 1,
      consecutiveActiveDays: 1,
      currentVersion: APP_VERSION,
      dataSchemaVersion: SCHEMA_VERSION,
    },
    relationship: {
      familiarity: 5,
      trust: 5,
      bond: 5,
      interactionCount: 0,
      completedReminderCount: 0,
      ignoredReminderCount: 0,
      sharedMemoryCount: 1,
      dailyGrowth: { [today]: 0 },
    },
    personality: {
      active: 10,
      quiet: 10,
      clingy: 10,
      independent: 10,
      playful: 10,
      caring: 10,
    },
    state: {
      energy: 75,
      mood: 72,
      curiosity: 60,
      security: 68,
      roomComfort: 70,
      dailyMoodLabel: dailyStatusLabels[new Date().getDate() % dailyStatusLabels.length],
      dailyMoodDate: today,
    },
    daily: {
      date: today,
      greeted: false,
      status: dailyStatusLabels[new Date().getDate() % dailyStatusLabels.length],
      taskId: dailyTasks[new Date().getDate() % dailyTasks.length].id,
      taskLabel: dailyTasks[new Date().getDate() % dailyTasks.length].label,
      taskCompleted: false,
      minutes: 0,
      reminderCompletions: 0,
      interactions: 0,
    },
    memories: [buildFirstMemory(now, petName, ownerName)],
    collectibles: starterCollectibles,
    achievements: achievementTemplates,
    stats: {
      firstLaunchAt: now,
      totalUseDays: 1,
      consecutiveUseDays: 1,
      totalCompanionMinutes: 0,
      dailyCompanionMinutes: { [today]: 0 },
      interactionCount: 0,
      reminderShownCount: 0,
      reminderCompletedCount: 0,
      reminderIgnoredCount: 0,
      randomEventTriggerCount: 0,
      memoryUnlockCount: 1,
      achievementUnlockCount: 0,
      collectibleOwnedCount: starterCollectibles.filter((item) => item.owned).length,
      equippedItemIds: starterCollectibles.filter((item) => item.equipped).map((item) => item.itemId),
      day1Completed: true,
      day3Completed: false,
      day7Completed: false,
    },
    entitlements: [
      {
        entitlementId: "free",
        kind: "free",
        source: "free",
        grantedAt: now,
        signature: btoa(`free:free:${now}:pixelpal-local-v1`),
      },
    ],
    eventLog: {},
    claimedActivityRewards: {},
    quietMode: { enabled: false, fullscreenAuto: true, appKeywords: ["zoom", "teams", "meeting", "腾讯会议", "全屏"] },
  };
}

function migrateUnknown(raw: Partial<CompanionData>, petName: string, ownerName: string) {
  const base = createDefaultCompanion(petName, ownerName);
  const merged: CompanionData = {
    ...base,
    ...raw,
    profile: { ...base.profile, ...(raw.profile || {}), petName, ownerName, currentVersion: APP_VERSION, dataSchemaVersion: SCHEMA_VERSION },
    relationship: { ...base.relationship, ...(raw.relationship || {}) },
    personality: { ...base.personality, ...(raw.personality || {}) },
    state: { ...base.state, ...(raw.state || {}) },
    daily: { ...base.daily, ...(raw.daily || {}) },
    stats: { ...base.stats, ...(raw.stats || {}) },
    quietMode: { ...base.quietMode, ...(raw.quietMode || {}) },
    memories: raw.memories?.length ? raw.memories : base.memories,
    collectibles: mergeById(starterCollectibles, raw.collectibles || [], "itemId"),
    achievements: mergeById(achievementTemplates, raw.achievements || [], "achievementId"),
    entitlements: raw.entitlements?.length ? raw.entitlements : base.entitlements,
    eventLog: raw.eventLog || {},
    claimedActivityRewards: raw.claimedActivityRewards || {},
    schemaVersion: SCHEMA_VERSION,
  };
  return rolloverDaily(merged);
}

function mergeById<T extends Record<string, unknown>>(base: T[], existing: T[], key: keyof T) {
  return base.map((item) => ({ ...item, ...(existing.find((old) => old[key] === item[key]) || {}) }));
}

export function rolloverDaily(data: CompanionData, nowDate = new Date()): CompanionData {
  const today = todayKey(nowDate);
  if (data.daily.date === today && data.state.dailyMoodDate === today) return data;
  const previous = data.profile.lastActiveAt || data.daily.date;
  const gap = daysBetween(previous, today);
  const consecutive = gap === 1 ? data.profile.consecutiveActiveDays + 1 : gap === 0 ? data.profile.consecutiveActiveDays : 1;
  const task = dailyTasks[(nowDate.getDate() + consecutive) % dailyTasks.length];
  const status = dailyStatusLabels[(nowDate.getDate() + consecutive) % dailyStatusLabels.length];
  return {
    ...data,
    profile: {
      ...data.profile,
      lastActiveAt: nowDate.toISOString(),
      totalActiveDays: Math.max(data.profile.totalActiveDays, daysBetween(data.profile.firstMeetDate, today) + 1),
      consecutiveActiveDays: consecutive,
      currentVersion: APP_VERSION,
    },
    state: { ...data.state, dailyMoodDate: today, dailyMoodLabel: status, energy: Math.min(100, data.state.energy + 8), mood: Math.min(100, data.state.mood + 4) },
    daily: {
      date: today,
      greeted: false,
      status,
      taskId: task.id,
      taskLabel: task.label,
      taskCompleted: false,
      minutes: 0,
      reminderCompletions: 0,
      interactions: 0,
    },
    relationship: { ...data.relationship, dailyGrowth: { ...data.relationship.dailyGrowth, [today]: 0 } },
    stats: {
      ...data.stats,
      totalUseDays: Math.max(data.stats.totalUseDays, daysBetween(data.profile.firstMeetDate, today) + 1),
      consecutiveUseDays: consecutive,
      dailyCompanionMinutes: { ...data.stats.dailyCompanionMinutes, [today]: data.stats.dailyCompanionMinutes[today] || 0 },
    },
  };
}

export function loadCompanion(settings: { petName: string; ownerName: string }) {
  const existing = readJson<Partial<CompanionData> | null>(STORAGE_KEY, null);
  if (!existing) {
    const created = createDefaultCompanion(settings.petName, settings.ownerName);
    saveCompanion(created);
    return created;
  }
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(existing));
    return migrateUnknown(existing, settings.petName, settings.ownerName);
  } catch {
    const fallback = createDefaultCompanion(settings.petName, settings.ownerName);
    saveCompanion(fallback);
    return fallback;
  }
}

let saveTimer: number | undefined;
export function saveCompanion(data: CompanionData, debounce = true) {
  const write = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (!debounce) {
    write();
    return;
  }
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(write, 700);
}

export function exportCompanion(data: CompanionData) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), schemaVersion: SCHEMA_VERSION, data }, null, 2);
}

export function importCompanion(text: string, current: CompanionData) {
  const parsed = JSON.parse(text);
  const raw = parsed.data || parsed;
  localStorage.setItem(`${BACKUP_KEY}.${Date.now()}`, JSON.stringify(current));
  return migrateUnknown(raw, raw.profile?.petName || current.profile.petName, raw.profile?.ownerName || current.profile.ownerName);
}

export function personalityDescription(personality: Record<PersonalityKey, number>) {
  const top = Object.entries(personality).sort((a, b) => b[1] - a[1])[0]?.[0] as PersonalityKey | undefined;
  const map: Record<PersonalityKey, string> = {
    active: "它最近好像更有精神，也更愿意动起来。",
    quiet: "它已经习惯安静地陪你工作。",
    clingy: "它最近好像越来越黏你了。",
    independent: "它会自己安排小小的桌面时间。",
    playful: "它似乎变得有些调皮。",
    caring: "它越来越会提醒你照顾自己。",
  };
  return top ? map[top] : "它还在慢慢形成自己的性格。";
}
