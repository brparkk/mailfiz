import { languages } from '../lib/constant';

// 메일 톤 타입 정의
export type MailTone = 'default' | 'professional' | 'casual';

// 상태 타입 정의
export interface MailFormState {
  ui: {
    isLanguageOpen: boolean;
    isLoading: boolean;
    isSummarizing: boolean;
  };
  form: {
    selectedTone: MailTone;
    selectedLanguage: string;
    browserLanguage: string;
  };
  content: {
    generatedEmail: string | null;
    draftSummary: string | null;
  };
  messages: {
    error: string | null;
    summaryError: string | null;
    successMessage: string | null;
  };
}

// 액션 타입 정의
export type MailFormAction =
  | { type: 'TOGGLE_LANGUAGE_DROPDOWN' }
  | { type: 'SET_TONE'; payload: MailTone }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_BROWSER_LANGUAGE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUMMARIZING'; payload: boolean }
  | { type: 'SET_GENERATED_EMAIL'; payload: string | null }
  | { type: 'SET_DRAFT_SUMMARY'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUMMARY_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string | null }
  | { type: 'RESET_MESSAGES' };

// 초기 상태
export const initialMailFormState: MailFormState = {
  ui: {
    isLanguageOpen: false,
    isLoading: false,
    isSummarizing: false,
  },
  form: {
    selectedTone: 'default',
    selectedLanguage: languages[0].label,
    browserLanguage: 'en',
  },
  content: {
    generatedEmail: null,
    draftSummary: null,
  },
  messages: {
    error: null,
    summaryError: null,
    successMessage: null,
  },
};

// 리듀서 함수
export function mailFormReducer(
  state: MailFormState,
  action: MailFormAction
): MailFormState {
  switch (action.type) {
    case 'TOGGLE_LANGUAGE_DROPDOWN':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLanguageOpen: !state.ui.isLanguageOpen,
        },
      };
    case 'SET_TONE':
      return {
        ...state,
        form: {
          ...state.form,
          selectedTone: action.payload,
        },
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        form: {
          ...state.form,
          selectedLanguage: action.payload,
        },
      };
    case 'SET_BROWSER_LANGUAGE':
      return {
        ...state,
        form: {
          ...state.form,
          browserLanguage: action.payload,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };
    case 'SET_SUMMARIZING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isSummarizing: action.payload,
        },
      };
    case 'SET_GENERATED_EMAIL':
      return {
        ...state,
        content: {
          ...state.content,
          generatedEmail: action.payload,
        },
      };
    case 'SET_DRAFT_SUMMARY':
      return {
        ...state,
        content: {
          ...state.content,
          draftSummary: action.payload,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        messages: {
          ...state.messages,
          error: action.payload,
        },
      };
    case 'SET_SUMMARY_ERROR':
      return {
        ...state,
        messages: {
          ...state.messages,
          summaryError: action.payload,
        },
      };
    case 'SET_SUCCESS_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          successMessage: action.payload,
        },
      };
    case 'RESET_MESSAGES':
      return {
        ...state,
        messages: {
          error: null,
          summaryError: null,
          successMessage: null,
        },
      };
    default:
      return state;
  }
}

// 액션 생성자 함수들
export const mailFormActions = {
  toggleLanguageDropdown: () => ({ type: 'TOGGLE_LANGUAGE_DROPDOWN' }) as const,
  setTone: (tone: MailTone) => ({ type: 'SET_TONE', payload: tone }) as const,
  setLanguage: (language: string) =>
    ({ type: 'SET_LANGUAGE', payload: language }) as const,
  setBrowserLanguage: (language: string) =>
    ({ type: 'SET_BROWSER_LANGUAGE', payload: language }) as const,
  setLoading: (isLoading: boolean) =>
    ({ type: 'SET_LOADING', payload: isLoading }) as const,
  setSummarizing: (isSummarizing: boolean) =>
    ({ type: 'SET_SUMMARIZING', payload: isSummarizing }) as const,
  setGeneratedEmail: (email: string | null) =>
    ({ type: 'SET_GENERATED_EMAIL', payload: email }) as const,
  setDraftSummary: (summary: string | null) =>
    ({ type: 'SET_DRAFT_SUMMARY', payload: summary }) as const,
  setError: (error: string | null) =>
    ({ type: 'SET_ERROR', payload: error }) as const,
  setSummaryError: (error: string | null) =>
    ({ type: 'SET_SUMMARY_ERROR', payload: error }) as const,
  setSuccessMessage: (message: string | null) =>
    ({ type: 'SET_SUCCESS_MESSAGE', payload: message }) as const,
  resetMessages: () => ({ type: 'RESET_MESSAGES' }) as const,
};
