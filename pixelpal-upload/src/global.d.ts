export {};

declare global {
  interface Window {
    pixelpal?: {
      openUrl: (url: string) => Promise<boolean>;
      openApp: (target: string) => Promise<boolean>;
      platform: () => Promise<{ platform: string; home: string }>;
      activeContext: () => Promise<{ app: string; title: string }>;
      saveSecret: (key: string, value: string) => Promise<boolean>;
      loadSecret: (key: string) => Promise<string>;
      close: () => Promise<void>;
    };
  }
}
