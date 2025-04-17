/* eslint-disable no-unused-vars */
// Chrome API 타입 정의
interface Chrome {
  tabs: {
    query: (queryInfo: object) => Promise<ChromeTab[]>;
    sendMessage: (tabId: number, message: object) => Promise<any>;
  };
  runtime: {
    onMessage: {
      addListener: (
        listener: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ) => void;
    };
  };
  storage: {
    sync: {
      get: (
        keys: string | string[] | object
      ) => Promise<{ [key: string]: any }>;
      set: (items: object) => Promise<void>;
    };
  };
}

interface ChromeTab {
  id?: number;
  url?: string;
  active?: boolean;
  windowId?: number;
}

// 전역 chrome 객체 선언
declare const chrome: Chrome;
