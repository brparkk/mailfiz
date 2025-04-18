import { useState } from 'react';
import Button from './Button';
import SelectButton from './SelectButton';
import { languages } from '../../lib/constant';
import ArrowIcon from '../icons/ArrowIcon';

function MailForm() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].label);

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
        <legend className="block text-sm font-medium text-text-primary">
          Select tone
        </legend>
        <div className="flex gap-2 mt-3">
          <Button className="active">Default</Button>
          <Button>Professional</Button>
          <Button>Casual</Button>
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
      <Button
        type="submit"
        variant="primary"
        className="w-full h-12 rounded-[8px] mt-12 font-medium"
      >
        Generate
      </Button>
    </form>
  );
}

export default MailForm;
