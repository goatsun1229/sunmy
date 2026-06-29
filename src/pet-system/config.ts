import type { Achievement, Collectible, RandomEventConfig } from "./types";

export const SCHEMA_VERSION = 1;
export const APP_VERSION = "1.0.0-beta.4";

export const dailyTasks = [
  { id: "pet_once", label: "摸摸它一次" },
  { id: "open_memory", label: "打开一次回忆册" },
  { id: "quiet_company", label: "安静陪伴十分钟" },
  { id: "watch_together", label: "陪它看一会儿视频" },
  { id: "complete_reminder", label: "完成一次提醒" },
  { id: "click_three", label: "点击宠物三次" },
];

export const dailyStatusLabels = ["很有精神", "有点困", "想安静陪伴", "对新软件很好奇", "想整理房间", "想收到一次互动"];

export const starterCollectibles: Collectible[] = [
  {
    itemId: "badge_first_meet",
    itemType: "badge",
    name: "初次相遇徽章",
    description: "你们第一次见面的纪念。",
    rarity: "common",
    assetPath: "placeholder:badge",
    unlockType: "initial",
    unlockCondition: "first_meet",
    price: 0,
    currencyType: "free",
    isLimited: false,
    owned: true,
    equipped: true,
  },
  {
    itemId: "hat_soft_cap",
    itemType: "hat",
    name: "软软小帽",
    description: "一顶轻便的小帽子。",
    rarity: "common",
    assetPath: "placeholder:hat",
    unlockType: "free",
    unlockCondition: "day_3",
    price: 0,
    currencyType: "free",
    isLimited: false,
    owned: false,
    equipped: false,
  },
  {
    itemId: "keepsake_7day_card",
    itemType: "keepsake",
    name: "七日纪念卡",
    description: "陪伴满七天后获得。",
    rarity: "rare",
    assetPath: "placeholder:card",
    unlockType: "streak",
    unlockCondition: "7_days",
    price: 0,
    currencyType: "free",
    isLimited: false,
    owned: false,
    equipped: false,
  },
];

export const achievementTemplates: Achievement[] = [
  { achievementId: "first_meet", title: "初次相遇", description: "和码伴第一次见面。", hidden: false, progress: 0, target: 1, rewardItemId: "badge_first_meet" },
  { achievementId: "streak_3", title: "相伴3天", description: "连续陪伴3天。", hidden: false, progress: 0, target: 3 },
  { achievementId: "streak_7", title: "相伴7天", description: "连续陪伴7天。", hidden: false, progress: 0, target: 7, rewardItemId: "keepsake_7day_card" },
  { achievementId: "streak_30", title: "相伴30天", description: "连续陪伴30天。", hidden: false, progress: 0, target: 30 },
  { achievementId: "active_10h", title: "陪伴10小时", description: "累计陪伴达到10小时。", hidden: false, progress: 0, target: 600 },
  { achievementId: "active_100h", title: "陪伴100小时", description: "累计陪伴达到100小时。", hidden: false, progress: 0, target: 6000 },
  { achievementId: "reminders_10", title: "照顾节奏", description: "完成10次提醒。", hidden: false, progress: 0, target: 10 },
  { achievementId: "reminders_100", title: "稳定生活家", description: "完成100次提醒。", hidden: false, progress: 0, target: 100 },
  { achievementId: "memories_10", title: "回忆收藏家", description: "解锁10条回忆。", hidden: false, progress: 0, target: 10 },
  { achievementId: "items_5", title: "小小收藏柜", description: "获得5件收藏。", hidden: false, progress: 0, target: 5 },
  { achievementId: "late_night", title: "深夜陪伴", description: "第一次在深夜一起待着。", hidden: true, progress: 0, target: 1 },
  { achievementId: "festival_first", title: "节日惊喜", description: "触发第一次节日事件。", hidden: true, progress: 0, target: 1 },
  { achievementId: "hidden_action", title: "发现隐藏动作", description: "遇见一个特殊动作。", hidden: true, progress: 0, target: 1 },
  { achievementId: "personality_clear", title: "性格初现", description: "宠物形成明显性格。", hidden: false, progress: 0, target: 60 },
];

const eventNames = [
  "edge_fishing:在屏幕边缘钓鱼:边边好像有小鱼。",
  "cursor_startle:被鼠标指针吓到:刚刚有东西飞过去了。",
  "secret_nap:偷偷睡觉:我眯一小会儿。",
  "clean_spot:打扫自己的位置:这里擦亮一点。",
  "tiny_snack:拿出一个小零食:要不要也休息一口？",
  "watch_video:观察用户正在看的视频:这个画面好像很热闹。",
  "mimic_scene:模仿用户当前场景:我也学你认真一下。",
  "small_chair:搬一把小椅子坐下:我坐这里陪你。",
  "yawn:打哈欠:哈欠会传染吗？",
  "hold_pillow:抱着枕头:抱枕头办公也算陪伴。",
  "peek_window:在窗口边缘探头:我看看你在忙什么。",
  "switch_confused:对频繁切换窗口表示困惑:刚刚去了好多地方。",
  "water_offer:工作时间过长后递水:喝口水再继续吧。",
  "old_gift:突然拿出以前获得的礼物:这个我还留着呢。",
  "desktop_walk:在桌面散步:我走一小圈。",
  "hide_short:短暂躲起来:我藏一下下。",
  "click_react:对点击次数作出反应:收到你的暗号了。",
  "night_pajama:深夜穿睡衣:夜深了，慢一点。",
  "morning_stretch:早晨伸懒腰:早呀，今天也慢慢来。",
  "weekend_relax:周末表现得更放松:今天可以松一点。",
  "idle_play:用户长时间无操作时独自玩耍:我自己玩一会儿。",
  "reminder_party:完成提醒后庆祝:完成啦，真不错。",
  "reminder_sigh:忽略提醒后温和叹气:没关系，下次再说。",
  "close_mouse:亲密度高时主动靠近鼠标:我靠近一点点。",
  "quiet_read:安静性格时坐着阅读:我安静看会儿书。",
  "play_chase:调皮性格时追逐鼠标:我追到它了吗？",
  "cling_window:黏人性格时停留在当前窗口附近:我就在这里。",
  "curious_app:好奇心高时观察新打开的软件:这是新的地方吗？",
  "low_energy_sleep:低精力时逐渐入睡:我有点困啦。",
  "special_day_gift:特殊日期准备小礼物:今天适合放一份小惊喜。",
];

export const randomEvents: RandomEventConfig[] = eventNames.map((entry, index) => {
  const [eventId, name] = entry.split(":");
  return {
    eventId,
    name,
    triggerConditions: index % 5 === 0 ? ["watching"] : index % 4 === 0 ? ["night"] : ["any"],
    probability: index < 8 ? 0.18 : 0.12,
    cooldownMinutes: 45 + (index % 4) * 15,
    maxDailyTriggers: index % 6 === 0 ? 1 : 2,
    requiredRelationship: index > 20 ? { bond: 20 } : undefined,
    requiredPersonality: index === 24 ? { quiet: 45 } : index === 25 ? { playful: 45 } : undefined,
    animationKey: eventId,
    dialogueKey: eventId,
    reward: index % 7 === 0 ? { familiarity: 1 } : undefined,
    memoryTrigger: index === 17 ? "late_night" : index === 29 ? "festival" : undefined,
    enabled: true,
  };
});

export const activities = [
  { activityId: "new_year", title: "新年", startDate: "01-01", endDate: "01-07", theme: "new_year", rewardItems: [], enabled: true },
  { activityId: "spring", title: "春季", startDate: "03-01", endDate: "04-30", theme: "spring", rewardItems: [], enabled: true },
  { activityId: "summer", title: "夏日", startDate: "07-01", endDate: "08-31", theme: "summer", rewardItems: [], enabled: true },
  { activityId: "halloween", title: "万圣节", startDate: "10-25", endDate: "10-31", theme: "halloween", rewardItems: [], enabled: true },
  { activityId: "christmas", title: "圣诞节", startDate: "12-20", endDate: "12-26", theme: "christmas", rewardItems: [], enabled: true },
  { activityId: "birthday", title: "用户生日", startDate: "", endDate: "", theme: "birthday", rewardItems: [], enabled: false },
  { activityId: "anniversary", title: "相识纪念日", startDate: "", endDate: "", theme: "anniversary", rewardItems: [], enabled: true },
];

export const products = [
  { productId: "free", name: "免费版", entitlementKind: "free", price: 0 },
  { productId: "premium_lifetime_early_100", name: "高级版买断 前100名", entitlementKind: "premiumLifetime", price: 9.9 },
  { productId: "premium_lifetime_early_1000", name: "高级版买断 前1000名", entitlementKind: "premiumLifetime", price: 19.9 },
  { productId: "premium_lifetime", name: "高级版买断", entitlementKind: "premiumLifetime", price: 49.9 },
  { productId: "season_pass", name: "主题季票", entitlementKind: "seasonPass", price: 19.9 },
];
