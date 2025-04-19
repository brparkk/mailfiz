import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Chrome API 관련 유틸리티 함수
 */

/**
 * Gmail 탭으로 메시지 전송하는 함수
 */
export const sendToGmail = async (
  emailText: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 현재 활성화된 탭 가져오기
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      throw new Error('활성화된 탭을 찾을 수 없습니다.');
    }

    // 현재 탭에 메시지 보내기
    const response = await chrome.tabs.sendMessage(tabs[0].id!, {
      action: 'insertEmailText',
      text: emailText,
    });

    return response;
  } catch (error) {
    console.error('Gmail에 이메일 보내기 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
};

// Gmail에서 이메일 내용 가져오기
export const getEmailContentFromGmail = async (): Promise<{
  success: boolean;
  content?: string;
  error?: string;
}> => {
  try {
    // 현재 활성화된 탭 가져오기
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      throw new Error('활성화된 탭을 찾을 수 없습니다.');
    }

    // 현재 탭에 메시지 보내기
    const response = await chrome.tabs.sendMessage(tabs[0].id!, {
      action: 'getEmailContent',
    });

    return response;
  } catch (error) {
    console.error('Gmail에서 이메일 내용 가져오기 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
};

export const getBrowserLanguage = () => {
  const language = navigator.language || (navigator as any).userLanguage;
  return language.split('-')[0];
};
