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

  try {
    // 줄바꿈 문자를 HTML <br> 태그로 변환
    // 1. 단일 줄바꿈 처리
    let formattedText = text.replace(/\n/g, '<br>');

    // 2. 이중 줄바꿈(문단 구분)을 더 큰 간격으로 처리
    formattedText = formattedText.replace(/<br><br>/g, '<br><br>');

    // 3. 공백 유지
    formattedText = formattedText.replace(/ {2,}/g, function (match) {
      return '&nbsp;'.repeat(match.length);
    });

    // 4. 의미있는 구조를 위해 단락으로 묶기
    // 빈 줄로 구분된 단락을 <p> 태그로 감싸기
    const paragraphs = formattedText.split(/<br><br>/g);
    formattedText = paragraphs
      .map((p) => (p.trim() ? `<p>${p}</p>` : ''))
      .join('');

    console.log('포맷된 텍스트:', formattedText);

    // 에디터에 텍스트 삽입
    editor.innerHTML = formattedText;

    // 변경 이벤트 발생시켜 Gmail이 변경을 인식하도록 함
    const event = new Event('input', { bubbles: true });
    editor.dispatchEvent(event);

    console.log('이메일 텍스트 삽입 성공 (줄바꿈 처리 적용)');
  } catch (error) {
    console.error('텍스트 삽입 중 오류 발생:', error);

    // 오류 발생 시 원본 텍스트 그대로 삽입 시도
    editor.innerHTML = text;
    const event = new Event('input', { bubbles: true });
    editor.dispatchEvent(event);
  }
}

// 요약 텍스트를 Gmail 에디터에 삽입하는 함수
function insertSummaryToEditor(summary: string): void {
  const editor = findGmailEditor();
  if (!editor) {
    console.error('Gmail 에디터를 찾을 수 없습니다.');
    return;
  }

  try {
    // 현재 에디터 내용 확인
    const currentContent = editor.innerHTML;

    // 요약 형식 정의
    const formattedSummary = `
<div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 15px; background-color: #f9f9f9;">
  <div style="font-weight: bold; margin-bottom: 5px;">Email Summary:</div>
  <div>${summary.replace(/\n/g, '<br>')}</div>
</div>
<br>
`;

    // 요약을 에디터 시작 부분에 삽입
    editor.innerHTML = formattedSummary + currentContent;

    // 변경 이벤트 발생시켜 Gmail이 변경을 인식하도록 함
    const event = new Event('input', { bubbles: true });
    editor.dispatchEvent(event);

    console.log('요약 삽입 성공');
  } catch (error) {
    console.error('요약 삽입 중 오류 발생:', error);
  }
}

// MailForm으로부터 메시지 받기
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log(
    'Chrome 확장 프로그램으로부터 메시지 수신:',
    message.action || message
  );

  if (message.action === 'getEmailContent') {
    try {
      // 먼저 메일 내용을 확인
      console.log('메일 내용 확인 시도');
      const messageContent = getMessageContent();
      console.log('가져온 메일 내용:', messageContent ? '있음' : '없음');

      if (messageContent) {
        console.log('메일 내용 반환');
        sendResponse({ success: true, content: messageContent });
        return true;
      }

      // 메일 내용이 없으면 에디터 내용을 확인
      console.log('에디터 내용 확인 시도');
      const editorContent = getEditorContent();
      console.log('가져온 에디터 내용:', editorContent ? '있음' : '없음');

      sendResponse({ success: true, content: editorContent });
    } catch (error) {
      console.error('이메일 내용 가져오기 오류:', error);
      sendResponse({ success: false, error: String(error) });
    }
    return true;
  }

  if (message.action === 'insertEmailText') {
    try {
      console.log('이메일 텍스트 삽입 요청 수신');
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
      console.log('이메일 텍스트 삽입 성공');
      sendResponse({ success: true });
    } catch (error: unknown) {
      console.error('텍스트 삽입 중 오류 발생:', error);
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      sendResponse({ success: false, error: errorMessage });
    }
    return true;
  }

  // 새 메시지 핸들러: 요약 삽입
  if (message.action === 'insertEmailSummary') {
    try {
      console.log(
        '요약 삽입 요청 수신:',
        message.summary ? '요약 있음' : '요약 없음'
      );

      if (!message.summary) {
        throw new Error('요약 내용이 없습니다.');
      }

      // 요약을 에디터에 삽입
      insertSummaryToEditor(message.summary);
      console.log('요약 삽입 완료');
      sendResponse({ success: true });
    } catch (error) {
      console.error('요약 삽입 중 오류 발생:', error);
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      sendResponse({ success: false, error: errorMessage });
    }
    return true;
  }

  return true; // 비동기 응답을 위해 true 반환
});
