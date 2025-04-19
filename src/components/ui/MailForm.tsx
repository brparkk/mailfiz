import { useEffect, useRef, useReducer } from 'react';
import { generateText, generateEmailSummary } from '../../lib/api';
import { languages } from '../../lib/constant';
import {
  cn,
  getBrowserLanguage,
  getEmailContentFromGmail,
} from '../../lib/utils';
import { sendToGmail } from '../../lib/utils';
import ArrowIcon from '../icons/ArrowIcon';
import Button from './Button';
import SelectButton from './SelectButton';
import {
  initialMailFormState,
  mailFormActions,
  mailFormReducer,
} from '../../store';

function MailForm() {
  const [state, dispatch] = useReducer(mailFormReducer, initialMailFormState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);
  const apiKeyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 팝업이 열려있는 상태 유지
  useEffect(() => {
    // 페이지가 로드될 때 포커스를 어떤 요소에 설정
    if (apiKeyInputRef.current) {
      apiKeyInputRef.current.focus();
    }

    // 문서 클릭 이벤트 리스너 추가
    const handleDocumentClick = (e: MouseEvent) => {
      // 클릭이 팝업 내부에서 발생한 경우, 이벤트 버블링 중지
      e.stopPropagation();
    };

    // 문서에 클릭 이벤트 리스너 추가
    document.addEventListener('click', handleDocumentClick);

    // 팝업 상태 유지 요청 주기적으로 보내기
    const keepAliveTimer = setInterval(() => {
      try {
        // @ts-ignore
        chrome.runtime.sendMessage({ action: 'keepPopupOpen' });
      } catch (error) {
        console.error('팝업 상태 유지 요청 오류:', error);
      }
    }, 5000); // 5초마다 요청

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      clearInterval(keepAliveTimer);
    };
  }, []);

  // 브라우저 언어 감지
  useEffect(() => {
    const detectBrowserLanguage = () => {
      const baseLanguage = getBrowserLanguage();

      // 지원하는 언어인지 확인
      const supportedLanguage = languages.find(
        (lang) => lang.value === baseLanguage
      );

      // 지원하는 언어면 해당 언어로, 아니면 기본값 'en'으로 설정
      if (supportedLanguage) {
        dispatch(mailFormActions.setLanguage(supportedLanguage.label));
        dispatch(mailFormActions.setBrowserLanguage(baseLanguage));
      } else {
        dispatch(mailFormActions.setBrowserLanguage('en'));
      }
    };

    detectBrowserLanguage();

    // 저장된 API 키 가져오기
    const loadStoredApiKey = async () => {
      try {
        const result = await chrome.storage.sync.get('apiKey');
        if (result.apiKey && apiKeyInputRef.current) {
          apiKeyInputRef.current.value = result.apiKey;
        }
      } catch (e) {
        console.error('API 키 로드 중 오류 발생:', e);
      }
    };

    loadStoredApiKey();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (apiKeyTimerRef.current) {
        clearTimeout(apiKeyTimerRef.current);
      }
    };
  }, []);

  // 사용자가 입력한 텍스트 감지하여 자동으로 요약 생성
  const handleDraftChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const draftText = e.target.value;

    // 입력이 충분히 길면(50자 이상) 요약 시도
    if (
      draftText.length >= 50 &&
      !state.content.draftSummary &&
      !state.ui.isSummarizing &&
      apiKeyInputRef.current?.value
    ) {
      try {
        dispatch(mailFormActions.setSummarizing(true));
        dispatch(mailFormActions.setSummaryError(null));

        // 요약 생성
        const summary = await generateEmailSummary(
          draftText,
          state.form.browserLanguage,
          apiKeyInputRef.current.value
        );
        dispatch(mailFormActions.setDraftSummary(summary));
      } catch (error) {
        console.error('이메일 요약 생성 오류:', error);
        dispatch(
          mailFormActions.setSummaryError(
            error instanceof Error
              ? error.message
              : '요약 생성 중 오류가 발생했습니다.'
          )
        );
      } finally {
        dispatch(mailFormActions.setSummarizing(false));
      }
    }
  };

  // 요약 내용을 초기화하고 새로 생성
  const handleRegenerateSummary = async () => {
    if (!textareaRef.current?.value) {
      dispatch(mailFormActions.setSummaryError('요약할 내용이 없습니다.'));
      return;
    }

    if (!apiKeyInputRef.current?.value) {
      dispatch(mailFormActions.setSummaryError('API 키가 필요합니다.'));
      return;
    }

    try {
      dispatch(mailFormActions.setSummarizing(true));
      dispatch(mailFormActions.setSummaryError(null));

      // 요약 생성
      const summary = await generateEmailSummary(
        textareaRef.current.value,
        state.form.browserLanguage,
        apiKeyInputRef.current.value
      );
      dispatch(mailFormActions.setDraftSummary(summary));
    } catch (error) {
      console.error('이메일 요약 생성 오류:', error);
      dispatch(
        mailFormActions.setSummaryError(
          error instanceof Error
            ? error.message
            : '요약 생성 중 오류가 발생했습니다.'
        )
      );
    } finally {
      dispatch(mailFormActions.setSummarizing(false));
    }
  };

  // Handle API key input with debounce for auto-summary generation
  const handleApiKeyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const apiKey = e.target.value;

    // Clear any existing timer
    if (apiKeyTimerRef.current) {
      clearTimeout(apiKeyTimerRef.current);
    }

    // If API key is not empty
    if (apiKey) {
      // Set a new timer for 3 seconds
      apiKeyTimerRef.current = setTimeout(async () => {
        try {
          dispatch(mailFormActions.setSummarizing(true));
          dispatch(mailFormActions.setSummaryError(null));

          // 먼저 현재 탭이 Gmail인지 확인
          let isGmailTab = false;
          try {
            const tabs = await chrome.tabs.query({
              active: true,
              currentWindow: true,
            });

            if (tabs && tabs.length > 0 && tabs[0].url) {
              isGmailTab = tabs[0].url.includes('mail.google.com');
              console.log('현재 탭이 Gmail인지 확인:', isGmailTab);
            }
          } catch (tabError) {
            console.error('탭 정보 가져오기 오류:', tabError);
          }

          // Gmail에서 이메일 내용 가져오기 시도
          let gmailContent = '';
          if (isGmailTab) {
            try {
              console.log('Gmail 내용 가져오기 시도...');
              // 시간 초과를 추가하여 응답 대기 시간 설정
              const gmailResponsePromise = getEmailContentFromGmail();

              // 2초 후에 타임아웃
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(
                  () => reject(new Error('Gmail 내용 가져오기 시간 초과')),
                  2000
                );
              });

              // Promise.race로 먼저 완료되는 것을 선택
              const gmailResponse = (await Promise.race([
                gmailResponsePromise,
                timeoutPromise,
              ])) as { success: boolean; content?: string; error?: string };

              console.log('Gmail 응답:', gmailResponse);

              // Gmail 내용 가져오기 성공 시 해당 내용 사용
              if (
                gmailResponse &&
                gmailResponse.success &&
                gmailResponse.content
              ) {
                console.log('Gmail 내용 가져오기 성공');
                // 내용을 텍스트 영역에 설정 (HTML 태그 제거)
                gmailContent = gmailResponse.content.replace(/<[^>]*>/g, '');
                if (textareaRef.current) {
                  textareaRef.current.value = gmailContent;
                }
              }
            } catch (error) {
              console.error('Gmail 내용 가져오기 오류:', error);
              // 오류 발생 시 무시하고 계속 진행 (텍스트 영역의 내용 사용)
            }
          } else {
            console.log(
              '현재 탭이 Gmail이 아니므로 내용 가져오기를 시도하지 않습니다.'
            );
          }

          // Gmail에서 내용을 가져왔거나 텍스트 영역에 내용이 있는 경우
          if (gmailContent || textareaRef.current?.value) {
            // 요약 생성
            const summary = await generateEmailSummary(
              gmailContent || textareaRef.current!.value,
              state.form.browserLanguage,
              apiKey
            );

            dispatch(mailFormActions.setDraftSummary(summary));

            // 생성된 요약을 Gmail 에디터에 자동으로 삽입
            if (isGmailTab) {
              try {
                // 현재 활성화된 탭 가져오기
                const tabs = await chrome.tabs.query({
                  active: true,
                  currentWindow: true,
                });
                if (tabs && tabs.length > 0) {
                  // Gmail에 요약 삽입 시도
                  const insertPromise = chrome.tabs.sendMessage(tabs[0].id!, {
                    action: 'insertEmailSummary',
                    summary: summary,
                  });

                  // 2초 후에 타임아웃
                  const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(
                      () => reject(new Error('요약 삽입 시간 초과')),
                      2000
                    );
                  });

                  // Promise.race로 먼저 완료되는 것을 선택
                  await Promise.race([insertPromise, timeoutPromise]);
                  console.log('요약 Gmail 에디터에 삽입 시도 완료');
                }
              } catch (insertError) {
                console.error('요약 삽입 오류:', insertError);
                // 요약 삽입 실패해도 계속 진행
              }
            } else {
              console.log(
                '현재 탭이 Gmail이 아니므로 요약 삽입을 시도하지 않습니다.'
              );
            }
          }
          // 내용이 없는 경우
          else {
            dispatch(
              mailFormActions.setSummaryError(
                '이메일 내용이 없습니다. Gmail에서 내용을 가져오지 못했거나 작성된 내용이 없습니다.'
              )
            );
          }
        } catch (error) {
          console.error('이메일 요약 생성 오류:', error);
          dispatch(
            mailFormActions.setSummaryError(
              error instanceof Error
                ? error.message
                : '요약 생성 중 오류가 발생했습니다.'
            )
          );
        } finally {
          dispatch(mailFormActions.setSummarizing(false));
        }
      }, 3000); // 3 seconds delay
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(mailFormActions.resetMessages());

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
      dispatch(mailFormActions.setLoading(true));
      const generatedMail = await generateText(
        messages,
        state.form.selectedLanguage,
        state.form.selectedTone,
        apiKey
      );

      dispatch(mailFormActions.setGeneratedEmail(generatedMail));

      // 텍스트 생성 직후 자동으로 Gmail에 삽입
      if (generatedMail) {
        const result = await sendToGmail(generatedMail);
        if (result.success) {
          dispatch(
            mailFormActions.setSuccessMessage(
              '이메일이 Gmail 에디터에 성공적으로 삽입되었습니다.'
            )
          );
        } else {
          dispatch(
            mailFormActions.setError(
              `Gmail에 삽입 실패: ${result.error || '알 수 없는 오류'}`
            )
          );
        }
      }

      dispatch(mailFormActions.setLoading(false));
      return generatedMail;
    } catch (error) {
      console.error(error);
      dispatch(mailFormActions.setLoading(false));
      dispatch(mailFormActions.setError('이메일 생성 중 오류가 발생했습니다.'));
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

      {/* API Key 섹션 */}
      <fieldset>
        <legend className="block text-sm font-medium text-text-primary">
          API Key
        </legend>
        <input
          ref={apiKeyInputRef}
          type="text"
          name="mailfiz-api-key"
          placeholder="Enter your API key"
          className="w-full h-9.5 mt-2 rounded-[8px] px-4 py-2 font-light text-xs border border-border placeholder:text-input-placeholder placeholder:text-xs"
          onChange={handleApiKeyInput}
        />
      </fieldset>

      {/* 이메일 요약 섹션 */}
      <fieldset>
        <div className="flex justify-between items-center">
          <legend className="block text-sm font-medium text-text-primary">
            Email Summary
          </legend>
          {state.content.draftSummary && (
            <button
              type="button"
              onClick={handleRegenerateSummary}
              className="text-xs text-blue-500 hover:text-blue-700"
              disabled={state.ui.isSummarizing}
            >
              {state.ui.isSummarizing ? 'Regenerating...' : 'Regenerate'}
            </button>
          )}
        </div>
        <div className="w-full h-auto min-h-[120px] mt-2 p-4 rounded-[8px] bg-background overflow-y-auto text-text-primary font-light text-xs placeholder:text-input-placeholder active:outline-primary">
          {state.ui.isSummarizing ? (
            <div className="text-gray-500">생성 중...</div>
          ) : state.content.draftSummary ? (
            <div className="whitespace-pre-line">
              {state.content.draftSummary}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              name="mailfiz-summary-email"
              placeholder="Email Summary"
              className="w-full h-auto"
              onChange={handleDraftChange}
            />
          )}
        </div>
        {state.messages.summaryError && (
          <div className="text-red-500 text-xs mt-1">
            {state.messages.summaryError}
          </div>
        )}
      </fieldset>

      {/* 이메일 생성 섹션 */}
      <fieldset>
        <legend className="block text-sm font-medium text-text-primary">
          Create Email Draft
        </legend>
        <textarea
          ref={textareaRef}
          name="mailfiz-textarea"
          placeholder="Enter your rough draft here..."
          className="w-full h-40 p-4 mt-2 rounded-[8px] bg-background overflow-y-auto text-text-primary font-light text-xs placeholder:text-input-placeholder active:outline-primary"
          onChange={handleDraftChange}
        />
      </fieldset>

      {/* 톤 선택 섹션 */}
      <fieldset>
        <legend className="block text-sm font-medium text-text-primary">
          Select tone
        </legend>
        <div className="flex gap-2 mt-3">
          {['default', 'professional', 'casual'].map((tone) => (
            <Button
              key={tone}
              className={cn(state.form.selectedTone === tone && 'active')}
              onClick={() => dispatch(mailFormActions.setTone(tone as any))}
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
            onClick={() => dispatch(mailFormActions.toggleLanguageDropdown())}
            className="flex justify-between items-center w-full mt-3 border border-border rounded-[8px] py-2 px-3 text-sm text-text-primary"
          >
            <span>{state.form.selectedLanguage}</span>
            <ArrowIcon isOpen={state.ui.isLanguageOpen} />
          </button>
          {state.ui.isLanguageOpen && (
            <div className="absolute w-full mt-1 bg-white border border-border rounded-[8px] shadow-lg z-10">
              {languages.map((lang) => (
                <SelectButton
                  key={lang.value}
                  onClick={() => {
                    dispatch(mailFormActions.setLanguage(lang.label));
                    dispatch(mailFormActions.toggleLanguageDropdown());
                  }}
                  isSelected={state.form.selectedLanguage === lang.label}
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
        <div className="w-full h-40 p-4 mt-2 rounded-[8px] bg-background overflow-y-auto text-text-primary font-light text-xs placeholder:text-input-placeholder active:outline-primary">
          {state.content.generatedEmail
            ? extractEmailBody(state.content.generatedEmail)
            : '이메일이 생성되면 여기에 표시됩니다.'}
        </div>
      </fieldset>
      {state.messages.error && (
        <div className="text-red-500 text-sm mt-1">{state.messages.error}</div>
      )}
      {state.messages.successMessage && (
        <div className="text-green-500 text-sm mt-1">
          {state.messages.successMessage}
        </div>
      )}
      <Button
        type="submit"
        variant="primary"
        className="w-full h-12 rounded-[8px] mt-8 font-medium"
        disabled={state.ui.isLoading}
      >
        {state.ui.isLoading ? 'Generating...' : 'Generate'}
      </Button>
    </form>
  );
}

export default MailForm;
