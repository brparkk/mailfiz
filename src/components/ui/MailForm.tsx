import { useState } from 'react';
import { generateText } from '../../lib/api';
import { languages } from '../../lib/constant';
import { cn } from '../../lib/utils';
import ArrowIcon from '../icons/ArrowIcon';
import Button from './Button';
import SelectButton from './SelectButton';

type MailTone = 'default' | 'professional' | 'casual';

// Gmail 탭으로 메시지 전송하는 함수
async function sendToGmail(
  text: string
): Promise<{ success: boolean; error?: string }> {
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
      text,
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
}

function MailForm() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<MailTone>('default');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].label);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const messages = formData.get('mailfiz-textarea') as string;
    const apiKey = formData.get('mailfiz-api-key') as string;

    // API 키 저장
    try {
      await chrome.storage.sync.set({ apiKey });
    } catch (e) {
      console.error('API 키 저장 중 오류 발생:', e);
    }

    try {
      setIsLoading(true);
      const generatedMail = await generateText(
        messages,
        selectedLanguage,
        selectedTone,
        apiKey
      );

      setGeneratedEmail(generatedMail);

      // 텍스트 생성 직후 자동으로 Gmail에 삽입
      if (generatedMail) {
        const result = await sendToGmail(generatedMail);
        if (result.success) {
          setSuccessMessage(
            '이메일이 Gmail 에디터에 성공적으로 삽입되었습니다.'
          );
        } else {
          setError(`Gmail에 삽입 실패: ${result.error || '알 수 없는 오류'}`);
        }
      }

      setIsLoading(false);
      return generatedMail;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setError('이메일 생성 중 오류가 발생했습니다.');
      return null;
    }
  };

  // 생성된 이메일에서 본문만 추출하는 함수
  const extractEmailBody = (email: string | null): string => {
    if (!email) return '';

    const match = email.match(
      /\[Email Body Starts\]\s*([\s\S]*?)\s*\[Email Body Ends\]/
    );
    return match ? match[1].trim() : email;
  };

  return (
    <form
      id="mailfiz-form"
      className="flex flex-col gap-5 py-6 px-5"
      onSubmit={handleSubmit}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-2xl font-bold text-text-primary">
          Mailfiz
        </legend>
        <span className="text-sm text-text-secondary">
          AI-powered email drafting
        </span>
      </fieldset>
      {/* TODO: Summary of Email Contents */}
      <fieldset>
        <legend className="block text-sm font-medium text-text-primary">
          API Key
        </legend>
        <input
          type="text"
          name="mailfiz-api-key"
          placeholder="Enter your API key"
          className="w-full h-9.5 mt-2 rounded-[8px] px-4 py-2 font-light text-xs border border-border placeholder:text-input-placeholder placeholder:text-xs"
        />
      </fieldset>
      <textarea
        name="mailfiz-textarea"
        placeholder="Enter your rough draft here..."
        className="w-full h-40 p-4 rounded-[8px] bg-background overflow-y-auto text-text-primary font-light text-xs placeholder:text-input-placeholder active:outline-primary"
      />
      <fieldset>
        <legend className="block text-sm font-medium text-text-primary">
          Select tone
        </legend>
        <div className="flex gap-2 mt-3">
          {['default', 'professional', 'casual'].map((tone) => (
            <Button
              key={tone}
              className={cn(selectedTone === tone && 'active')}
              onClick={() => setSelectedTone(tone as MailTone)}
            >
              {tone}
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="block text-sm font-medium text-text-primary">
          Select language
        </legend>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="flex justify-between items-center w-full mt-3 border border-border rounded-[8px] py-2 px-3 text-sm text-text-primary"
          >
            <span>{selectedLanguage}</span>
            <ArrowIcon isOpen={isLanguageOpen} />
          </button>
          {isLanguageOpen && (
            <div className="absolute w-full mt-1 bg-white border border-border rounded-[8px] shadow-lg z-10">
              {languages.map((lang) => (
                <SelectButton
                  key={lang.value}
                  onClick={() => {
                    setSelectedLanguage(lang.label);
                    setIsLanguageOpen(false);
                  }}
                  isSelected={selectedLanguage === lang.label}
                >
                  {lang.label}
                </SelectButton>
              ))}
            </div>
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend className="block text-sm font-medium text-text-primary">
          Generated Email Preview
        </legend>
        <div className="w-full h-40 p-4 rounded-[8px] bg-background overflow-y-auto text-text-primary font-light text-xs placeholder:text-input-placeholder active:outline-primary">
          {generatedEmail
            ? extractEmailBody(generatedEmail)
            : '이메일이 생성되면 여기에 표시됩니다.'}
        </div>
      </fieldset>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      {successMessage && (
        <div className="text-green-500 text-sm mt-1">{successMessage}</div>
      )}
      <Button
        type="submit"
        variant="primary"
        className="w-full h-12 rounded-[8px] mt-8 font-medium"
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </Button>
    </form>
  );
}

export default MailForm;
