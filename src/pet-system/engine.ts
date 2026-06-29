import { achievementTemplates, randomEvents, starterCollectibles } from "./config";
import { dialogueByCategory } from "./dialogues";
import type { Achievement, CompanionData, Memory, MemoryType, RandomEventConfig } from "./types";
import { safeId } from "./storage";

const MAX_DAILY_GROWTH = 12;

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function clamp(value: number, max = 100) {
  return Math.max(0, Math.min(max, value));
}

export function addMemory(data: CompanionData, type: MemoryType, title: string, description: string, relatedStats: Record<string, string | number | boolean> = {}) {
  if (data.memories.some((memory) => memory.type === type && memory.title === title)) return data;
  const memory: Memory = {
    memoryId: safeId("memory"),
    type,
    title,
    description,
    createdAt: new Date().toISOString(),
    relatedStats,
    image: `placeholder:${type}`,
    hidden: false,
    viewed: false,
  };
  return {
    ...data,
    memories: [memory, ...data.memories],
    relationship: { ...data.relationship, sharedMemoryCount: data.relationship.sharedMemoryCount + 1 },
    stats: { ...data.stats, memoryUnlockCount: data.stats.memoryUnlockCount + 1 },
  };
}

export function growRelationship(data: CompanionData, changes: { familiarity?: number; trust?: number; bond?: number; personality?: Partial<Record<string, number>> }) {
  const today = todayKey();
  const used = data.relationship.dailyGrowth[today] || 0;
  const requested = (changes.familiarity || 0) + (changes.trust || 0) + (changes.bond || 0);
  const allowed = Math.max(0, Math.min(requested, MAX_DAILY_GROWTH - used));
  const scale = requested > 0 ? allowed / requested : 0;
  const nextPersonality = { ...data.personality };
  for (const [key, value] of Object.entries(changes.personality || {})) {
    nextPersonality[key as keyof typeof nextPersonality] = clamp((nextPersonality[key as keyof typeof nextPersonality] || 0) + Number(value), 100);
  }
  return {
    ...data,
    relationship: {
      ...data.relationship,
      familiarity: clamp(data.relationship.familiarity + (changes.familiarity || 0) * scale),
      trust: clamp(data.relationship.trust + (changes.trust || 0) * scale),
      bond: clamp(data.relationship.bond + (changes.bond || 0) * scale),
      dailyGrowth: { ...data.relationship.dailyGrowth, [today]: used + allowed },
    },
    personality: nextPersonality,
  };
}

export function recordInteraction(data: CompanionData, kind: "pet" | "command" | "reminder_done" | "reminder_ignored" | "memory" | "quiet") {
  let next = data;
  const base = {
    pet: { familiarity: 1, bond: 1, personality: { clingy: 1, active: 1 } },
    command: { familiarity: 1, personality: { caring: 1 } },
    reminder_done: { trust: 1, bond: 1, personality: { caring: 2 } },
    reminder_ignored: { personality: { quiet: 1, independent: 1 } },
    memory: { bond: 1, personality: { caring: 1 } },
    quiet: { trust: 1, personality: { quiet: 1, independent: 1 } },
  }[kind];
  next = growRelationship(next, base);
  const today = todayKey();
  next = {
    ...next,
    relationship: {
      ...next.relationship,
      interactionCount: next.relationship.interactionCount + 1,
      completedReminderCount: kind === "reminder_done" ? next.relationship.completedReminderCount + 1 : next.relationship.completedReminderCount,
      ignoredReminderCount: kind === "reminder_ignored" ? next.relationship.ignoredReminderCount + 1 : next.relationship.ignoredReminderCount,
    },
    daily: {
      ...next.daily,
      interactions: next.daily.interactions + 1,
      reminderCompletions: kind === "reminder_done" ? next.daily.reminderCompletions + 1 : next.daily.reminderCompletions,
      taskCompleted: next.daily.taskCompleted || (next.daily.taskId === "click_three" && next.daily.interactions >= 2) || (next.daily.taskId === "complete_reminder" && kind === "reminder_done") || (next.daily.taskId === "open_memory" && kind === "memory"),
    },
    stats: {
      ...next.stats,
      interactionCount: next.stats.interactionCount + 1,
      reminderCompletedCount: kind === "reminder_done" ? next.stats.reminderCompletedCount + 1 : next.stats.reminderCompletedCount,
      reminderIgnoredCount: kind === "reminder_ignored" ? next.stats.reminderIgnoredCount + 1 : next.stats.reminderIgnoredCount,
      dailyCompanionMinutes: { ...next.stats.dailyCompanionMinutes, [today]: next.stats.dailyCompanionMinutes[today] || 0 },
    },
  };
  if (kind === "reminder_done") next = addMemory(next, "first_reminder", "第一次完成提醒", "你们完成了第一次休息或生活提醒。", {});
  return evaluateAchievements(evaluateGrowthMemories(next));
}

export function addActiveMinute(data: CompanionData) {
  const today = todayKey();
  const minutes = (data.stats.dailyCompanionMinutes[today] || 0) + 1;
  const next = {
    ...data,
    profile: { ...data.profile, totalActiveMinutes: data.profile.totalActiveMinutes + 1, lastActiveAt: new Date().toISOString() },
    daily: { ...data.daily, minutes: data.daily.minutes + 1 },
    stats: {
      ...data.stats,
      totalCompanionMinutes: data.stats.totalCompanionMinutes + 1,
      dailyCompanionMinutes: { ...data.stats.dailyCompanionMinutes, [today]: minutes },
    },
  };
  return evaluateAchievements(evaluateGrowthMemories(next));
}

function evaluateGrowthMemories(data: CompanionData) {
  let next = data;
  if (next.profile.consecutiveActiveDays >= 3) next = addMemory(next, "streak_3", "连续陪伴3天", "你们已经连续相伴3天。", { days: 3 });
  if (next.profile.consecutiveActiveDays >= 7) next = addMemory(next, "streak_7", "七日纪念", "你们已经相伴七天，获得了七日纪念卡。", { days: 7, minutes: next.profile.totalActiveMinutes });
  if (next.profile.consecutiveActiveDays >= 30) next = addMemory(next, "streak_30", "连续陪伴30天", "一个月的桌面陪伴被记录下来。", { days: 30 });
  if (next.profile.totalActiveMinutes >= 600) next = addMemory(next, "active_10h", "累计陪伴10小时", "你们已经累计陪伴10小时。", { minutes: next.profile.totalActiveMinutes });
  if (next.profile.totalActiveMinutes >= 6000) next = addMemory(next, "active_100h", "累计陪伴100小时", "这是一段很长的陪伴。", { minutes: next.profile.totalActiveMinutes });
  return next;
}

export function evaluateAchievements(data: CompanionData) {
  let changed = false;
  let nextItems = data.collectibles;
  const ownedCount = nextItems.filter((item) => item.owned).length;
  const personalityPeak = Math.max(...Object.values(data.personality));
  const progress: Record<string, number> = {
    first_meet: 1,
    streak_3: data.profile.consecutiveActiveDays,
    streak_7: data.profile.consecutiveActiveDays,
    streak_30: data.profile.consecutiveActiveDays,
    active_10h: data.profile.totalActiveMinutes,
    active_100h: data.profile.totalActiveMinutes,
    reminders_10: data.relationship.completedReminderCount,
    reminders_100: data.relationship.completedReminderCount,
    memories_10: data.memories.length,
    items_5: ownedCount,
    late_night: data.memories.some((memory) => memory.type === "late_night") ? 1 : 0,
    festival_first: data.memories.some((memory) => memory.type === "festival") ? 1 : 0,
    hidden_action: data.memories.some((memory) => memory.type === "special_action") ? 1 : 0,
    personality_clear: personalityPeak,
  };
  const achievements: Achievement[] = achievementTemplates.map((template) => {
    const existing = data.achievements.find((item) => item.achievementId === template.achievementId) || template;
    const value = Math.min(existing.target, progress[template.achievementId] || 0);
    if (!existing.unlockedAt && value >= existing.target) {
      changed = true;
      if (existing.rewardItemId) nextItems = unlockItem(nextItems, existing.rewardItemId);
      return { ...existing, progress: value, unlockedAt: new Date().toISOString() };
    }
    return { ...existing, progress: Math.max(existing.progress, value) };
  });
  return {
    ...data,
    achievements,
    collectibles: nextItems,
    stats: {
      ...data.stats,
      achievementUnlockCount: achievements.filter((item) => item.unlockedAt).length,
      collectibleOwnedCount: nextItems.filter((item) => item.owned).length,
      equippedItemIds: nextItems.filter((item) => item.equipped).map((item) => item.itemId),
      day3Completed: data.profile.consecutiveActiveDays >= 3,
      day7Completed: data.profile.consecutiveActiveDays >= 7,
    },
  };
}

export function unlockItem(items: CompanionData["collectibles"], itemId: string) {
  const hasItem = items.some((item) => item.itemId === itemId);
  const source = hasItem ? items : [...items, ...starterCollectibles.filter((item) => item.itemId === itemId)];
  return source.map((item) => (item.itemId === itemId ? { ...item, owned: true } : item));
}

export function equipItem(data: CompanionData, itemId: string) {
  const target = data.collectibles.find((item) => item.itemId === itemId);
  if (!target?.owned) return data;
  const collectibles = data.collectibles.map((item) => {
    if (item.itemId === itemId) return { ...item, equipped: !item.equipped };
    if (item.itemType === target.itemType && target.itemType !== "badge" && target.itemType !== "keepsake") return { ...item, equipped: false };
    return item;
  });
  return { ...data, collectibles, stats: { ...data.stats, equippedItemIds: collectibles.filter((item) => item.equipped).map((item) => item.itemId) } };
}

export function maybeRandomEvent(data: CompanionData, contextText: string, focusMode = false) {
  if (data.quietMode.enabled || (data.quietMode.until && Date.now() < data.quietMode.until) || focusMode) return null;
  const today = todayKey();
  const hour = new Date().getHours();
  const candidates = randomEvents.filter((event) => canTrigger(event, data, contextText, hour, today));
  const event = candidates.find((candidate) => Math.random() < candidate.probability);
  if (!event) return null;
  const log = data.eventLog[event.eventId] || { lastTriggeredAt: "", dailyCount: {} };
  const nextData = {
    ...data,
    eventLog: {
      ...data.eventLog,
      [event.eventId]: { lastTriggeredAt: new Date().toISOString(), dailyCount: { ...log.dailyCount, [today]: (log.dailyCount[today] || 0) + 1 } },
    },
    stats: { ...data.stats, randomEventTriggerCount: data.stats.randomEventTriggerCount + 1 },
  };
  return { data: event.reward ? growRelationship(nextData, event.reward) : nextData, text: dialogueByCategory("event", randomEvents.indexOf(event)), animationKey: event.animationKey };
}

function canTrigger(event: RandomEventConfig, data: CompanionData, contextText: string, hour: number, today: string) {
  if (!event.enabled) return false;
  const log = data.eventLog[event.eventId];
  if ((log?.dailyCount[today] || 0) >= event.maxDailyTriggers) return false;
  if (log?.lastTriggeredAt && Date.now() - new Date(log.lastTriggeredAt).getTime() < event.cooldownMinutes * 60000) return false;
  if (event.requiredRelationship?.bond && data.relationship.bond < event.requiredRelationship.bond) return false;
  if (event.requiredPersonality && Object.entries(event.requiredPersonality).some(([key, value]) => data.personality[key as keyof typeof data.personality] < Number(value))) return false;
  if (event.triggerConditions.includes("night") && !(hour >= 23 || hour < 5)) return false;
  if (event.triggerConditions.includes("watching") && !/youtube|bilibili|视频|chrome|edge/.test(contextText)) return false;
  return true;
}

export function greetingFor(data: CompanionData) {
  const hour = new Date().getHours();
  const days = Math.max(1, Math.floor((Date.now() - new Date(data.profile.firstMeetDate).getTime()) / 86400000) + 1);
  if (data.profile.consecutiveActiveDays >= 7 && !data.stats.day7Completed) return `我们已经相伴七天啦，${data.profile.ownerName}。`;
  if (hour >= 23 || hour < 5) return "夜深了，我会轻一点陪你。";
  if (hour < 11) return `早呀，${data.profile.ownerName}，我们认识第 ${days} 天了。`;
  if (hour < 14) return "中午了，记得吃点东西。";
  if (hour < 19) return `我今天的状态是：${data.daily.status}。`;
  return `今天我们已经一起待了 ${data.daily.minutes} 分钟。`;
}

export function eveningSummary(data: CompanionData) {
  if (data.daily.minutes < 30) return undefined;
  const parts = [`今天我们一起待了 ${data.daily.minutes} 分钟。`];
  if (data.daily.reminderCompletions > 0) parts.push(`你完成了 ${data.daily.reminderCompletions} 次提醒。`);
  if (data.daily.interactions > 0) parts.push(`我们互动了 ${data.daily.interactions} 次。`);
  return parts.join("");
}

export function saveSevenDayCard(data: CompanionData) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520"><rect width="100%" height="100%" fill="#f4f0e8"/><rect x="40" y="40" width="820" height="440" rx="18" fill="#fffaf0" stroke="#77736c"/><text x="90" y="125" font-size="42" font-family="sans-serif" fill="#242424">七日纪念卡</text><text x="90" y="190" font-size="26" font-family="sans-serif" fill="#4c4c4e">宠物：${escapeXml(data.profile.petName)}</text><text x="90" y="240" font-size="26" font-family="sans-serif" fill="#4c4c4e">主人：${escapeXml(data.profile.ownerName)}</text><text x="90" y="290" font-size="26" font-family="sans-serif" fill="#4c4c4e">首次相遇：${data.profile.firstMeetDate.slice(0, 10)}</text><text x="90" y="340" font-size="26" font-family="sans-serif" fill="#4c4c4e">陪伴天数：${data.profile.consecutiveActiveDays}</text><text x="90" y="390" font-size="26" font-family="sans-serif" fill="#4c4c4e">累计陪伴：${data.profile.totalActiveMinutes} 分钟</text><text x="90" y="440" font-size="22" font-family="sans-serif" fill="#77736c">慢慢相处的第一个七天。</text></svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `PixelPal-七日纪念卡-${data.profile.petName}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeXml(text: string) {
  return text.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[char] || char));
}

