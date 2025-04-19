// Gmail 에디터를 찾는 함수
function findGmailEditor(): HTMLElement | null {
  // Gmail 에디터는 contenteditable div로 구현되어 있음
  return document.querySelector('div[role="textbox"][contenteditable="true"]');
}

// Gmail 받은 메일 내용을 찾는 함수
function findGmailMessageContent(): HTMLElement | null {
  // Gmail 받은 메일은 보통 다음 선택자로 찾을 수 있음
  // 1. 메일 본문 영역 (가장 일반적인 클래스)
  let messageBody = document.querySelector('.a3s.aiL');

  // 2. 대체 선택자로 시도
  if (!messageBody) {
    messageBody = document.querySelector('[data-message-id] .ii.gt');
  }

  // 3. 또 다른 대체 선택자
  if (!messageBody) {
    messageBody = document.querySelector('.gs .adP.adO div');
  }

  return messageBody as HTMLElement | null;
}

// Gmail 에디터 내용 가져오기
function getEditorContent(): string {
  const editor = findGmailEditor();
  if (!editor) {
    console.error('Gmail 에디터를 찾을 수 없습니다.');
    return '';
  }
  return editor.innerHTML;
}

// Gmail 받은 메일 내용 가져오기
function getMessageContent(): string {
  const messageBody = findGmailMessageContent();
  if (!messageBody) {
    console.error('Gmail 메일 내용을 찾을 수 없습니다.');
    return '';
  }
  return messageBody.innerHTML;
}

// 생성된 텍스트를 Gmail 에디터에 삽입하는 함수
function insertTextToEditor(text: string): void {
  const editor = findGmailEditor();
  if (!editor) {
    console.error('Gmail 에디터를 찾을 수 없습니다.');
    return;
  }

  // 에디터에 텍스트 삽입
  editor.innerHTML = text;

  // 변경 이벤트 발생시켜 Gmail이 변경을 인식하도록 함
  const event = new Event('input', { bubbles: true });
  editor.dispatchEvent(event);
}

// MailForm으로부터 메시지 받기
chrome.runtime.onMessage.addListener((message, sendResponse) => {
  if (message.action === 'getEmailContent') {
    try {
      // 먼저 메일 내용을 확인
      const messageContent = getMessageContent();
      if (messageContent) {
        sendResponse({ success: true, content: messageContent });
        return true;
      }

      // 메일 내용이 없으면 에디터 내용을 확인
      const editorContent = getEditorContent();
      sendResponse({ success: true, content: editorContent });
    } catch (error) {
      console.error('이메일 내용 가져오기 오류:', error);
      sendResponse({ success: false, error: String(error) });
    }
    return true;
  }

  if (message.action === 'insertEmailText') {
    try {
      // 정규식을 사용하여 이메일 본문만 추출
      const generatedText = message.text;
      if (!generatedText) {
        throw new Error('생성된 텍스트가 없습니다.');
      }

      const emailBodyMatch = generatedText.match(
        /\[Email Body Starts\]\s*([\s\S]*?)\s*\[Email Body Ends\]/
      );
      const emailBody = emailBodyMatch
        ? emailBodyMatch[1].trim()
        : generatedText;

      // 생성된 텍스트를 에디터에 삽입
      insertTextToEditor(emailBody);
      sendResponse({ success: true });
    } catch (error: unknown) {
      console.error('텍스트 삽입 중 오류 발생:', error);
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      sendResponse({ success: false, error: errorMessage });
    }
    return true;
  }
  return true; // 비동기 응답을 위해 true 반환
});
