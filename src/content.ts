// Gmail 에디터를 찾는 함수
function findGmailEditor(): HTMLElement | null {
  // Gmail 에디터는 contenteditable div로 구현되어 있음
  return document.querySelector('div[role="textbox"][contenteditable="true"]');
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  }
  return true; // 비동기 응답을 위해 true 반환
});
