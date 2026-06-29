export type Dialogue = {
  id: string;
  category: string;
  text: string;
  cooldownMinutes: number;
};

const seeds = [
  ["morning", "早呀，今天也慢慢来。"], ["morning", "我已经醒啦，在这里等你。"], ["morning", "早晨的桌面有点安静。"], ["morning", "今天也一起开始吧。"], ["morning", "先深呼吸一下。"],
  ["noon", "中午了，记得吃点东西。"], ["noon", "午间适合暂停一下。"], ["noon", "我闻到午休的味道了。"], ["noon", "别一直坐着呀。"], ["noon", "下午前先补点水。"],
  ["evening", "今天辛苦了。"], ["evening", "傍晚适合收一收尾。"], ["evening", "我今天陪了你很久。"], ["evening", "慢慢结束今天也很好。"], ["evening", "晚上别太赶。"],
  ["night", "夜深了，眼睛也要休息。"], ["night", "我把声音放轻一点。"], ["night", "深夜模式，轻轻陪你。"], ["night", "再忙也别忘了睡觉。"], ["night", "抱着枕头陪你一会儿。"],
  ["return", "你回来啦，我刚刚整理了一下房间。"], ["return", "好久不见也没关系。"], ["return", "我还在这里。"], ["return", "欢迎回来，今天慢慢来。"], ["return", "桌面又热闹起来了。"],
  ["work", "你工作的时候，我安静一点。"], ["work", "这段看起来需要专注。"], ["work", "我陪你把这一小段做完。"], ["work", "键盘声听起来很认真。"], ["work", "我在旁边守着进度。"],
  ["video", "这个视频看起来很有趣。"], ["video", "我也坐好一起看。"], ["video", "画面动起来了。"], ["video", "这段我也想看。"], ["video", "我不挡着你。"],
  ["reminder", "起来走走，活动一下。"], ["reminder", "喝口水再继续吧。"], ["reminder", "肩膀可以放松一下。"], ["reminder", "完成啦，真不错。"], ["reminder", "没关系，下次再做也可以。"],
  ["bond", "它最近好像越来越黏你了。"], ["bond", "它已经习惯安静地陪你工作。"], ["bond", "它似乎变得有些调皮。"], ["bond", "它对你的节奏越来越熟悉。"], ["bond", "它知道什么时候该安静。"],
  ["daily", "今天的目标很轻，只要一点点互动。"], ["daily", "今天我想收到一次摸摸。"], ["daily", "今天适合打开回忆册看看。"], ["daily", "今天一起安静十分钟吧。"], ["daily", "如果你忙，我就自己玩一会儿。"],
  ["memory", "我把这件事记下来了。"], ["memory", "这可以放进回忆册。"], ["memory", "以后再看，会想起今天。"], ["memory", "这是一条新的共同回忆。"], ["memory", "小小的一天也值得留下。"],
  ["item", "有一件新东西可以试试。"], ["item", "这个小装饰还挺适合我。"], ["item", "先放进收藏柜里。"], ["item", "我会好好保存它。"], ["item", "这是一点点奖励。"],
  ["achievement", "好像完成了一个小成就。"], ["achievement", "这一步值得记一下。"], ["achievement", "你看，我们又多了一点进度。"], ["achievement", "成就不是压力，是纪念。"], ["achievement", "慢慢积累也很好。"],
  ["event", "边边好像有小鱼。"], ["event", "刚刚有东西飞过去了。"], ["event", "我眯一小会儿。"], ["event", "这里擦亮一点。"], ["event", "要不要也休息一口？"],
  ["event", "这个画面好像很热闹。"], ["event", "我也学你认真一下。"], ["event", "我坐这里陪你。"], ["event", "哈欠会传染吗？"], ["event", "抱枕头办公也算陪伴。"],
  ["event", "我看看你在忙什么。"], ["event", "刚刚去了好多地方。"], ["event", "喝口水再继续吧。"], ["event", "这个我还留着呢。"], ["event", "我走一小圈。"],
  ["event", "我藏一下下。"], ["event", "收到你的暗号了。"], ["event", "夜深了，慢一点。"], ["event", "早呀，今天也慢慢来。"], ["event", "今天可以松一点。"],
  ["event", "我自己玩一会儿。"], ["event", "完成啦，真不错。"], ["event", "没关系，下次再说。"], ["event", "我靠近一点点。"], ["event", "我安静看会儿书。"],
  ["event", "我追到它了吗？"], ["event", "我就在这里。"], ["event", "这是新的地方吗？"], ["event", "我有点困啦。"], ["event", "今天适合放一份小惊喜。"],
  ["quiet", "安静模式开启，我会少打扰你。"], ["quiet", "我先轻轻待着。"], ["quiet", "需要我的时候再叫我。"], ["quiet", "专注的时候，我会靠边。"], ["quiet", "我把气泡收小一点。"],
  ["seven", "我们已经相伴七天啦。"], ["seven", "这张纪念卡要好好保存。"], ["seven", "七天不算短，我们慢慢熟悉了。"], ["seven", "我把这周记在回忆册里。"], ["seven", "之后也请多关照。"],
];

export const dialogues: Dialogue[] = seeds.map(([category, text], index) => ({
  id: `${category}_${String(index + 1).padStart(3, "0")}`,
  category,
  text,
  cooldownMinutes: category === "event" ? 40 : 20,
}));

export function dialogueByCategory(category: string, salt = 0) {
  const list = dialogues.filter((dialogue) => dialogue.category === category);
  return list.length ? list[Math.abs(salt) % list.length].text : "我在这里。";
}

