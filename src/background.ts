// background.ts
// 팝업이 닫히지 않도록 하는 기능

// 확장 프로그램이 설치될 때 실행
// @ts-ignore
chrome.runtime.onInstalled.addListener(() => {
  console.log('MailFiz 확장 프로그램이 설치되었습니다.');
});

// 팝업이 열릴 때 이벤트 처리
// @ts-ignore
chrome.action.onClicked.addListener(() => {
  // 이미 열려있는 팝업이 있다면 닫지 않음
  console.log('MailFiz 아이콘이 클릭되었습니다.');
});

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // 팝업 상태 유지 관련 메시지 처리
  if (message.action === 'keepPopupOpen') {
    // 팝업이 열려있는 상태 유지
    console.log('팝업 상태 유지 요청 수신');
    sendResponse({ success: true });
    return true;
  }

  return true;
});

// 서비스 워커 활성화 상태 유지
const keepAlive = () =>
  setInterval(() => {
    console.log('백그라운드 서비스 워커 활성 상태 유지');
  }, 20000);

keepAlive();
