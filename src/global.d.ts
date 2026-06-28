export {};

declare global {
  interface Window {
    pixelpal?: {
      openUrl: (url: string) => Promise<boolean>;
      openApp: (target: string) => Promise<boolean>;
      platform: () => Promise<{ platform: string; home: string }>;
      activeContext: () => Promise<{ app: string; title: string }>;
      snapEdge: () => Promise<{ hidden: boolean; edge: "left" | "right" | "top" | "bottom" | null }>;
      revealEdge: () => Promise<{ hidden: boolean; edge: "left" | "right" | "top" | "bottom" | null }>;
      saveSecret: (key: string, value: string) => Promise<boolean>;
      loadSecret: (key: string) => Promise<string>;
      copyText: (text: string) => Promise<boolean>;
      close: () => Promise<void>;
    };
  }
}
