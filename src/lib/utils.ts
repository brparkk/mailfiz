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
    // 현재 활성화된 탭 정보 가져오기
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    // 활성화된 탭이 없으면 에러
    if (!tabs || tabs.length === 0) {
      throw new Error('현재 활성화된 탭을 찾을 수 없습니다.');
    }

    // Gmail 탭인지 확인
    const gmailTab = tabs[0];
    if (!gmailTab.url?.includes('mail.google.com')) {
      throw new Error(
        'Gmail이 열려있지 않습니다. Gmail을 열고 다시 시도해주세요.'
      );
    }

    // 메시지 전송
    if (!gmailTab.id) {
      throw new Error('탭 ID를 찾을 수 없습니다.');
    }

    const response = await chrome.tabs.sendMessage(gmailTab.id, {
      action: 'insertEmailText',
      text: emailText,
    });

    return response || { success: false, error: '응답이 없습니다.' };
  } catch (error) {
    console.error('Gmail에 메시지 전송 중 오류 발생:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
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
    // 현재 활성화된 탭 정보 가져오기
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    // 활성화된 탭이 없으면 에러
    if (!tabs || tabs.length === 0) {
      throw new Error('현재 활성화된 탭을 찾을 수 없습니다.');
    }

    // Gmail 탭인지 확인
    const gmailTab = tabs[0];
    if (!gmailTab.url?.includes('mail.google.com')) {
      throw new Error(
        'Gmail이 열려있지 않습니다. Gmail을 열고 다시 시도해주세요.'
      );
    }

    // 메시지 전송
    if (!gmailTab.id) {
      throw new Error('탭 ID를 찾을 수 없습니다.');
    }

    // 메시지 전송 및 응답 대기
    const response = await chrome.tabs.sendMessage(gmailTab.id, {
      action: 'getEmailContent',
    });

    return response || { success: false, error: '응답이 없습니다.' };
  } catch (error) {
    console.error('Gmail에서 이메일 내용 가져오기 오류:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

export const getBrowserLanguage = () => {
  const language = navigator.language || (navigator as any).userLanguage;
  return language.split('-')[0];
};
