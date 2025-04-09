# MailFiz

<img src="https://github.com/user-attachments/assets/e1785c89-4c73-4731-95d9-4dcb32258728" width="340" />

<p style="color:#dcdcdc;">
  <a style="font-size:12px;" href="https://www.figma.com/design/Yq0ZksnVtfNnuUPfDEyk0j/MailFiz-Assets?node-id=0-1&t=0SZK8PWPt7Ev8t5c-1" target="_blank">디자인 시안 보기 (Figma)</a>
</p>
     
## 프로젝트 개요

#### 개요

- 이메일 답변 시 키워드, 상황을 입력하면 자동으로 양식을 완성해주는 크롬 확장 기능

#### 목적

- 사용자가 다양한 언어와 어투로 공식적이고 정중한 이메일을 쉽게 작성할 수 있도록 지원

#### 타겟 사용자

- 이메일 작성의 효율성을 높이고 싶은 직장인 및 다국어 이메일 작성이 필요한 사용자

#### 핵심 기능

1. 이메일 답변 자동 생성
2. 다국어 지원 (한국어, 영어, 일본어, 중국어)
3. 상황별 맞춤 어투 제시 (기본, 격식, 구어체)
4. 이메일 클라이언트 자동 연동
5. 맞춤법 및 문법 검사

## 설치 방법

1. Chrome 웹 스토어에서 MailFiz 확장 프로그램 설치
2. 브라우저 우측 상단의 확장 프로그램 아이콘 클릭
3. MailFiz 아이콘을 클릭하여 팝업 메뉴 열기

## 사용 방법

1. Gmail 등 이메일 클라이언트에서 새 이메일 작성 페이지 열기
2. MailFiz 확장 프로그램 팝업에서:
   - 원하는 언어 선택
   - 이메일 작성 상황 입력
   - 어투 옵션 선택 (기본, 격식, 구어체)
3. "답변 생성" 버튼 클릭
4. 생성된 답변을 이메일 입력창에 자동 삽입

## 개발 환경 설정

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Chrome 브라우저

### 프로젝트 설정

```bash
# 프로젝트 클론
git clone https://github.com/yourusername/mailfiz.git
cd mailfiz

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 개발 도구 설정

```bash
# ESLint 설치
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Prettier 설치
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

# TypeScript 설치
npm install --save-dev typescript @types/node @types/react @types/react-dom
```

### ESLint 설정

`eslint.config.js` 파일 생성:

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'prettier': prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
```

### Prettier 설정

`prettier.config.js` 파일 생성:

```json
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

## 지원 언어

- 한국어
- 영어
- 일본어
- 중국어

## 개발 현황

### 진행 중인 작업

- [ ] 프로젝트 환경 세팅
- [ ] UI 및 로케일라이제이션
- [ ] API 연동 및 답변 생성
- [ ] 이메일 입력창 자동 삽입 기능
- [ ] 맞춤법 및 문법 검사 기능

### 테스트 진행 상황

- [ ] 유닛 테스트
- [ ] 통합 테스트
- [ ] 크로스 브라우징 테스트

## 기여하기

1. 이 저장소를 Fork합니다.
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`).
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 문의하기

- 이슈 트래커: [GitHub Issues](https://github.com/InnerCircle-ICD3/fe-library/issues/15)
- 이메일: <borapark13@gmail.com>

## Chrome Web Store

- 확장 프로그램이 Chrome Web Store에 출시되면 링크가 업데이트될 예정입니다.
