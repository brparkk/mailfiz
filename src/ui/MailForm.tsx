import { useState } from 'react';

function MailForm() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
  ];

  return (
    <form id="mailfiz-form" className="flex flex-col gap-5 py-6 px-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-2xl font-bold text-text-primary">
          Mailfiz
        </legend>
        <span className="text-sm text-text-secondary">
          AI-powered email drafting
        </span>
      </fieldset>
      <textarea
        name="mailfiz-textarea"
        placeholder="Enter your rough draft here..."
        className="w-full h-40 p-4 rounded-[8px] bg-background overflow-y-auto text-text-primary font-light text-xs placeholder:text-input-placeholder active:outline-primary"
      />
      <fieldset>
        <label htmlFor="mailfiz-select-tone">Select tone</label>
        <div className="flex gap-2 mt-3">
          <button type="button" className="default active">
            Default
          </button>
          <button type="button" className="default">
            Professional
          </button>
          <button type="button" className="default">
            Casual
          </button>
        </div>
      </fieldset>
      <fieldset>
        <label htmlFor="mailfiz-select-language">Select language</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="flex justify-between items-center w-full mt-3 border border-border rounded-[8px] py-2 px-3 text-sm text-text-primary"
          >
            <span>{selectedLanguage}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isLanguageOpen && (
            <div className="absolute w-full mt-1 bg-white border border-border rounded-[8px] shadow-lg z-10">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(lang.label);
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full p-2 text-left text-sm hover:bg-button-secondary ${
                    selectedLanguage === lang.label
                      ? 'text-primary bg-button-tertiary'
                      : 'text-text-primary'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </fieldset>
      <button
        type="submit"
        className="w-full h-12 rounded-[8px] bg-primary text-white mt-12 font-medium cursor-pointer"
      >
        Generate
      </button>
    </form>
  );
}

export default MailForm;
