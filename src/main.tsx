import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type PetState =
  | "coding"
  | "watching"
  | "writing"
  | "coffee"
  | "sleep"
  | "debug"
  | "success"
  | "error"
  | "charge";

type Reminder = {
  id: string;
  type: "once" | "interval" | "daily";
  message: string;
  nextFire?: number;
  interval?: number;
  time?: string;
  lastFireDay?: string;
};

type Settings = {
  petName: string;
  ownerName: string;
  scale: number;
  smartMode: boolean;
  autoMode: boolean;
  onboardingDone: boolean;
  autoEdgeHide: boolean;
};

type Edge = "left" | "right" | "top" | "bottom";
type ProductPage = "home" | "download" | "privacy" | "terms" | "feedback" | "release";

const defaultSettings: Settings = {
  petName: "小码",
  ownerName: "主人",
  scale: 1,
  smartMode: true,
  autoMode: true,
  onboardingDone: false,
  autoEdgeHide: true,
};

const states: PetState[] = [
  "coding",
  "watching",
  "writing",
  "coffee",
  "sleep",
  "debug",
  "success",
  "error",
  "charge",
];

const palette = {
  cream: "#eee6d7",
  creamHi: "#f8f1e5",
  creamLo: "#d7cdbb",
  panel: "#2a2a2b",
  screen: "#151516",
  glasses: "#2f2f31",
  key: "#4c4c4e",
  key2: "#8b8b88",
  base: "#565657",
  baseHi: "#77736c",
  amber: "#c8a86a",
  good: "#bfe6a8",
  bad: "#ff6b5f",
  eye: "#e8dfc9",
  cup: "#b8945c",
};

function loadSettings(): Settings {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem("pixelpal.settings") || "{}") };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings: Settings) {
  localStorage.setItem("pixelpal.settings", JSON.stringify(settings));
}

function loadReminders(): Reminder[] {
  try {
    return JSON.parse(localStorage.getItem("pixelpal.reminders") || "[]");
  } catch {
    return [];
  }
}

function saveReminders(reminders: Reminder[]) {
  localStorage.setItem("pixelpal.reminders", JSON.stringify(reminders));
}

function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [setupOpen, setSetupOpen] = useState(() => !loadSettings().onboardingDone);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [petState, setPetState] = useState<PetState>("coding");
  const [tick, setTick] = useState(0);
  const [bubble, setBubble] = useState("");
  const [bubbleUntil, setBubbleUntil] = useState(0);
  const [inputOpen, setInputOpen] = useState(false);
  const [command, setCommand] = useState("");
  const [reminders, setReminders] = useState(loadReminders);
  const [reminderMessage, setReminderMessage] = useState("起来走走，活动一下");
  const [reminderTime, setReminderTime] = useState("18:00");
  const [position, setPosition] = useState({ x: 120, y: 120 });
  const [deepSeekReady, setDeepSeekReady] = useState(false);
  const [appVersion, setAppVersion] = useState("1.0.0-beta.1");
  const [edgePose, setEdgePose] = useState<Edge | null>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveReminders(reminders), [reminders]);

  useEffect(() => {
    void window.pixelpal?.loadSecret("deepseek_key").then((value) => setDeepSeekReady(Boolean(value)));
    void window.pixelpal?.productInfo().then((info) => setAppVersion(info.version));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 420);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!settings.smartMode || !window.pixelpal) return;
    const timer = window.setInterval(async () => {
      const context = await window.pixelpal?.activeContext();
      const text = `${context?.app || ""} ${context?.title || ""}`.toLowerCase();
      if (/youtube|bilibili|哔哩|b站|netflix|twitch|vlc|iina|quicktime|chrome|edge|firefox/.test(text)) setPetState("watching");
      else if (/codex|claude|cursor|code|xcode|terminal|iterm|warp|powershell|cmd|windows terminal|capcut|剪映|visual studio|devenv|pycharm|webstorm/.test(text)) setPetState("coding");
      else if (/notion|notes|备忘录|word|pages|obsidian|docs|excel|powerpoint|wps|onenote/.test(text)) setPetState("writing");
    }, 2500);
    return () => window.clearInterval(timer);
  }, [settings.smartMode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      const today = new Date().toISOString().slice(0, 10);
      const hhmm = new Date().toTimeString().slice(0, 5);
      let changed = false;
      const next = reminders.filter((reminder) => {
        if (reminder.type === "once" && reminder.nextFire && now >= reminder.nextFire) {
          showBubble(reminder.message);
          return false;
        }
        if (reminder.type === "interval" && reminder.nextFire && now >= reminder.nextFire) {
          showBubble(reminder.message);
          reminder.nextFire = now + (reminder.interval || 7200000);
          changed = true;
        }
        if (reminder.type === "daily" && reminder.time === hhmm && reminder.lastFireDay !== today) {
          showBubble(reminder.message);
          reminder.lastFireDay = today;
          changed = true;
        }
        return true;
      });
      if (changed || next.length !== reminders.length) setReminders([...next]);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [reminders]);

  function showBubble(text: string, short = false) {
    setBubble(text);
    setBubbleUntil(tick + (short ? 8 : 28));
  }

  function nextState() {
    const index = states.indexOf(petState);
    setPetState(states[(index + 1) % states.length]);
  }

  function px(x: number, y: number, w = 1, h = 1, color = "#111") {
    const unit = 4 * settings.scale;
    return (
      <div
        className="pixel"
        style={{
          left: x * unit,
          top: y * unit,
          width: w * unit,
          height: h * unit,
          background: color,
        }}
      />
    );
  }

  const pixels = useMemo(() => {
    const tap = tick % 2;
    const lean = petState === "sleep" ? 1 : 0;
    const out: React.ReactNode[] = [];
    const add = (...nodes: React.ReactNode[]) => out.push(...nodes);

    add(px(12, 39, 26, 2, "#9b9b8d"), px(15, 41, 20, 1, "#bdbdae"));

    if (petState === "watching") {
      add(px(8, 28, 32, 12, "#343436"), px(9, 29, 30, 9, palette.screen), px(21, 32, 5, 4, palette.amber), px(26, 33, 1, 2, palette.amber), px(20, 40, 8, 2, palette.base), px(16, 42, 16, 2, palette.baseHi));
    } else {
      add(px(10, 34, 29, 6, palette.base), px(11, 33, 27, 2, palette.baseHi), px(13, 35, 3, 1, palette.amber));
      add(px(13, 29, 24, 6, "#343436"), px(14, 28, 22, 2, palette.key));
      for (let row = 0; row < 2; row++) for (let col = 0; col < 9; col++) add(px(15 + col * 2, 29 + row * 2, 1, 1, palette.key2));
      add(px(23, 33, 7, 1, palette.key2));
    }

    add(px(15 + lean, 9, 20, 22, palette.cream), px(16 + lean, 8, 18, 2, palette.creamHi), px(15 + lean, 29, 20, 2, palette.creamLo), px(14 + lean, 12, 1, 16, palette.creamLo), px(35 + lean, 12, 1, 16, "#c9beaa"));
    add(px(18 + lean, 31, 4, 3, palette.panel), px(29 + lean, 31, 4, 3, palette.panel), px(16 + lean, 14, 18, 10, palette.panel), px(17 + lean, 15, 16, 8, palette.screen));

    if (petState === "watching") add(px(20, 17, 3, 2, palette.good), px(29, 17, 3, 2, palette.good));
    else if (petState === "error") add(px(20, 16, 3, 3, palette.bad), px(28, 16, 3, 3, palette.bad), px(24, 21, 3, 1, palette.bad));
    else if (petState === "sleep") add(px(22, 18, 4, 1, palette.eye), px(28, 18, 4, 1, palette.eye));
    else add(px(20, 17, 3, 2, palette.eye), px(29, 17, 3, 2, palette.eye));

    if (petState === "coding" || petState === "debug" || petState === "sleep") {
      add(px(19 + lean, 16, 6, 1, palette.glasses), px(19 + lean, 16, 1, 4, palette.glasses), px(24 + lean, 16, 1, 4, palette.glasses), px(27 + lean, 16, 6, 1, palette.glasses), px(27 + lean, 16, 1, 4, palette.glasses), px(32 + lean, 16, 1, 4, palette.glasses), px(25 + lean, 18, 2, 1, palette.glasses));
    }

    if (edgePose) add(px(11, 10, 3, 18, "#c9beaa"), px(35, 10, 3, 18, "#c9beaa"), px(10, 27, 5, 3, palette.cream), px(34, 27, 5, 3, palette.creamLo));
    else if (petState === "coffee") add(px(12, 23, 4, 3, palette.cream), px(34, 25, 3, 2, palette.creamLo), px(10, 24, 4, 5, palette.cup), px(14, 25, 1, 2, palette.cup));
    else if (petState === "sleep") add(px(14, 26, 7, 2, palette.cream), px(31, 27, 4, 2, palette.creamLo), px(22, 27, 13, 3, "#cfc7bb"));
    else add(px(13, 25 + tap, 5, 3, palette.cream), px(32, 26 - tap, 5, 3, palette.creamLo));

    return out.map((node, index) => <React.Fragment key={index}>{node}</React.Fragment>);
  }, [edgePose, petState, settings.scale, tick]);

  async function handleCommand(text: string) {
    const raw = text.trim();
    const lower = raw.toLowerCase();
    if (!raw) return;

    if (/关于|版本|官网|下载页|主页|home|website/.test(lower)) {
      setAboutOpen(true);
      showBubble("产品信息在这里", true);
      return;
    }

    if (/检查更新|更新|最新版|release/.test(lower)) {
      await openProductPage("release", "打开更新页啦");
      return;
    }

    if (/隐私|privacy/.test(lower)) {
      await openProductPage("privacy", "隐私政策打开啦");
      return;
    }

    if (/协议|条款|terms/.test(lower)) {
      await openProductPage("terms", "用户协议打开啦");
      return;
    }

    if (/反馈方式|反馈页面|feedback page/.test(lower)) {
      await openProductPage("feedback", "反馈方式打开啦");
      return;
    }

    if (/反馈|问题|bug|故障|不好用|建议/.test(lower)) {
      await copyFeedbackTemplate();
      return;
    }

    if (lower.includes("打开") || lower.includes("open")) {
      const sites: Record<string, string> = {
        b站: "https://www.bilibili.com",
        bilibili: "https://www.bilibili.com",
        youtube: "https://www.youtube.com",
        github: "https://github.com",
      };
      for (const [key, url] of Object.entries(sites)) {
        if (lower.includes(key.toLowerCase())) {
          if (window.pixelpal) await window.pixelpal.openUrl(url);
          else window.open(url, "_blank");
          setPetState("success");
          showBubble("打开啦", true);
          return;
        }
      }
      const appMap: Record<string, string> = {
        "计算器": "计算器",
        calculator: "calculator",
        "备忘录": "备忘录",
        notes: "notes",
        "日历": "日历",
        calendar: "calendar",
        "终端": "终端",
        terminal: "terminal",
      };
      for (const [key, target] of Object.entries(appMap)) {
        if (lower.includes(key.toLowerCase())) {
          const opened = window.pixelpal ? await window.pixelpal.openApp(target) : false;
          setPetState(opened ? "success" : "error");
          showBubble(opened ? "打开啦" : "这个应用没打开", true);
          return;
        }
      }
      showBubble("这个我还不会打开", true);
      return;
    }

    if (lower.includes("天气") || lower.includes("weather")) {
      const city = raw.replace(/天气|怎么样|今天|现在|帮我|查询|查一下|？|\?/g, "").trim() || "Shanghai";
      setPetState("writing");
      showBubble("我看看天气...");
      try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=zh`);
        const json = await res.json();
        const now = json.current_condition?.[0];
        const desc = now?.lang_zh?.[0]?.value || now?.weatherDesc?.[0]?.value || "现在";
        showBubble(`${desc} ${now?.temp_C || ""}℃`);
      } catch {
        showBubble("天气没查到");
      }
      return;
    }

    const key = await window.pixelpal?.loadSecret("deepseek_key");
    if (!key) {
      showBubble("先设置 DeepSeek Key");
      return;
    }
    setPetState("writing");
    showBubble("我想想...");
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `你是一个桌面像素宠物，名字叫${settings.petName}，用户叫${settings.ownerName}。回答要简短、温柔、像陪伴用户办公的小助手。`,
            },
            { role: "user", content: raw },
          ],
          temperature: 0.7,
          max_tokens: 160,
        }),
      });
      const json = await response.json();
      showBubble(json.choices?.[0]?.message?.content || json.error?.message || "我没想出来");
    } catch {
      showBubble("我没连上 DeepSeek");
    }
  }

  function addWalkReminder() {
    setReminders([
      ...reminders,
      { id: crypto.randomUUID(), type: "interval", message: "起来走走，活动一下", interval: 7200000, nextFire: Date.now() + 7200000 },
    ]);
    showBubble("好，每2小时提醒你");
  }

  function addDailyReminder() {
    const message = reminderMessage.trim() || "记得处理一下";
    setReminders([
      ...reminders,
      {
        id: crypto.randomUUID(),
        type: "daily",
        message,
        time: reminderTime,
      },
    ]);
    setReminderOpen(false);
    showBubble(`好，${reminderTime}提醒你`, true);
  }

  function removeReminder(id: string) {
    setReminders(reminders.filter((reminder) => reminder.id !== id));
    showBubble("已删除提醒", true);
  }

  function finishSetup() {
    setSettings({ ...settings, onboardingDone: true });
    setSetupOpen(false);
    showBubble(`${settings.ownerName}，我准备好啦`, true);
  }

  async function setDeepSeekKey() {
    const value = window.prompt("输入 DeepSeek API Key，会加密保存在本机");
    if (value == null) return;
    const ok = await window.pixelpal?.saveSecret("deepseek_key", value.trim());
    setDeepSeekReady(Boolean(value.trim()));
    showBubble(ok ? "Key 已保存" : "保存失败");
  }

  async function openProductPage(page: ProductPage, message = "打开啦") {
    const opened = await window.pixelpal?.openProductPage(page);
    setPetState(opened ? "success" : "error");
    showBubble(opened ? message : "没打开成功", true);
  }

  async function copyFeedbackTemplate() {
    const platform = await window.pixelpal?.platform().catch(() => null);
    const context = await window.pixelpal?.activeContext().catch(() => null);
    const template = [
      "码伴 PixelPal 内测反馈",
      "",
      `系统：${platform?.platform || "未识别"}`,
      `宠物名：${settings.petName}`,
      `主人名：${settings.ownerName}`,
      `缩放：${settings.scale.toFixed(1)}`,
      `当前状态：${petState}`,
      `识别到的软件：${context?.app || "无"}`,
      `识别到的窗口：${context?.title || "无"}`,
      "",
      "是否能打开：",
      "是否能退出：",
      "遇到的问题：",
      "复现步骤：",
      "希望增加：",
      "截图/录屏：",
    ].join("\n");
    const copied = await window.pixelpal?.copyText(template);
    if (!copied && navigator.clipboard) await navigator.clipboard.writeText(template);
    setPetState("success");
    showBubble("反馈模板已复制", true);
  }

  async function snapToEdge() {
    if (setupOpen || reminderOpen || inputOpen) return;
    const result = await window.pixelpal?.snapEdge();
    if (result?.hidden && result.edge) {
      setEdgePose(result.edge);
      showBubble("我扒在边边啦", true);
    } else {
      showBubble("把我拖到屏幕边缘试试", true);
    }
  }

  async function revealFromEdge() {
    if (!edgePose) return;
    await window.pixelpal?.revealEdge();
    setEdgePose(null);
    showBubble("我出来啦", true);
  }

  return (
    <main>
      <div
        className={`pet ${edgePose ? `edge-pose edge-${edgePose}` : ""}`}
        style={{ left: position.x, top: position.y, width: 184 * settings.scale, height: 176 * settings.scale }}
        onMouseEnter={() => void revealFromEdge()}
        onPointerDown={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest("[data-no-drag]")) return;
          if (edgePose) void revealFromEdge();
          dragRef.current = { x: event.clientX, y: event.clientY, left: position.x, top: position.y, moved: false };
          (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current) return;
          const dx = event.clientX - dragRef.current.x;
          const dy = event.clientY - dragRef.current.y;
          dragRef.current.moved = dragRef.current.moved || Math.abs(dx) + Math.abs(dy) > 8;
          setPosition({ x: dragRef.current.left + dx, y: dragRef.current.top + dy });
        }}
        onPointerUp={() => {
          const moved = Boolean(dragRef.current?.moved);
          dragRef.current = null;
          if (moved && settings.autoEdgeHide) void snapToEdge();
        }}
        onDoubleClick={nextState}
      >
        {pixels}
        <button data-no-drag className="mini-bubble" onMouseEnter={() => setInputOpen(true)} onClick={() => setInputOpen(true)}>
          ...
        </button>
        {inputOpen && (
          <form
            data-no-drag
            className="inline-command"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCommand(command);
              setCommand("");
              setInputOpen(false);
            }}
          >
            <input autoFocus value={command} onChange={(event) => setCommand(event.target.value)} placeholder="问我或让我打开..." />
          </form>
        )}
        {bubble && tick <= bubbleUntil && <div data-no-drag className="speech">{bubble}</div>}
      </div>
      {setupOpen && (
        <section data-no-drag className="floating-card setup-card">
          <h1>码伴 PixelPal</h1>
          <label>
            叫我
            <input value={settings.petName} onChange={(event) => setSettings({ ...settings, petName: event.target.value })} />
          </label>
          <label>
            主人
            <input value={settings.ownerName} onChange={(event) => setSettings({ ...settings, ownerName: event.target.value })} />
          </label>
          <label className="toggle-row">
            智能陪伴
            <input type="checkbox" checked={settings.smartMode} onChange={(event) => setSettings({ ...settings, smartMode: event.target.checked })} />
          </label>
          <label className="toggle-row">
            自动贴边
            <input type="checkbox" checked={settings.autoEdgeHide} onChange={(event) => setSettings({ ...settings, autoEdgeHide: event.target.checked })} />
          </label>
          <div className="card-actions">
            <button onClick={() => void setDeepSeekKey()}>{deepSeekReady ? "更新Key" : "设置Key"}</button>
            <button onClick={finishSetup}>开始</button>
          </div>
        </section>
      )}
      {reminderOpen && (
        <section data-no-drag className="floating-card reminder-card">
          <h2>提醒</h2>
          <label>
            内容
            <input value={reminderMessage} onChange={(event) => setReminderMessage(event.target.value)} />
          </label>
          <label>
            时间
            <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
          </label>
          <div className="card-actions">
            <button onClick={addWalkReminder}>每2小时</button>
            <button onClick={addDailyReminder}>添加</button>
          </div>
          <div className="reminder-list">
            {reminders.length === 0 && <p>暂无提醒</p>}
            {reminders.map((reminder) => (
              <div className="reminder-item" key={reminder.id}>
                <span>{reminder.type === "interval" ? "循环" : reminder.time || "一次"} · {reminder.message}</span>
                <button onClick={() => removeReminder(reminder.id)}>删</button>
              </div>
            ))}
          </div>
        </section>
      )}
      {aboutOpen && (
        <section data-no-drag className="floating-card about-card">
          <h2>关于码伴</h2>
          <p>版本 {appVersion}</p>
          <div className="link-grid">
            <button onClick={() => void openProductPage("download", "下载页打开啦")}>下载页</button>
            <button onClick={() => void openProductPage("release", "更新页打开啦")}>更新</button>
            <button onClick={() => void openProductPage("privacy", "隐私政策打开啦")}>隐私</button>
            <button onClick={() => void openProductPage("terms", "用户协议打开啦")}>协议</button>
            <button onClick={() => void openProductPage("feedback", "反馈方式打开啦")}>反馈</button>
            <button onClick={() => setAboutOpen(false)}>收起</button>
          </div>
        </section>
      )}
      <nav data-no-drag className="panel">
        <button onClick={() => setPetState("coding")}>工作</button>
        <button onClick={() => setPetState("watching")}>看视频</button>
        <button onClick={() => setReminderOpen(!reminderOpen)}>提醒</button>
        <button onClick={() => setSetupOpen(!setupOpen)}>设置</button>
        <button onClick={() => void setDeepSeekKey()}>{deepSeekReady ? "更新Key" : "设置Key"}</button>
        <button onClick={() => void copyFeedbackTemplate()}>反馈</button>
        <button onClick={() => setAboutOpen(!aboutOpen)}>关于</button>
        <button onClick={() => setSettings({ ...settings, scale: Math.max(0.8, settings.scale - 0.1) })}>缩小</button>
        <button onClick={() => setSettings({ ...settings, scale: Math.min(1.5, settings.scale + 0.1) })}>放大</button>
        <button onClick={() => void snapToEdge()}>贴边</button>
        <button onClick={() => void window.pixelpal?.close()}>关闭</button>
      </nav>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
