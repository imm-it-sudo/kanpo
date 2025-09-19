import React, { useState, useEffect, useRef } from 'react';

const CheckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const SavingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onPromptChange }) => {
  const [currentPrompt, setCurrentPrompt] = useState(prompt);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Sync with parent prop if it changes
    setCurrentPrompt(prompt);
  }, [prompt]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentPrompt(newText);
    setSaveStatus('saving');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce saving to avoid excessive updates
    timeoutRef.current = window.setTimeout(() => {
      onPromptChange(newText);
      setSaveStatus('saved');
      
      // Reset status to idle after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 1000);
  };

  const renderStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-sm text-yellow-400" aria-live="polite">
            <SavingSpinner />
            <span className="ml-2">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center text-sm text-green-400" aria-live="polite">
            <CheckIcon />
            <span className="ml-2">Prompt saved!</span>
          </div>
        );
      case 'idle':
      default:
        return (
          <p className="text-xs text-gray-500">
            Your prompt is saved automatically in your browser.
          </p>
        );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Custom Instruction Prompt</h2>
      <p className="text-sm text-gray-400 mb-3">
        Modify the prompt to guide the AI on how to extract data from your image.
      </p>
      <textarea
        value={currentPrompt}
        onChange={handleTextChange}
        className="w-full h-48 p-3 bg-brand-dark border border-gray-600 rounded-md text-gray-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
        aria-label="Custom Instruction Prompt"
        placeholder="Enter your custom prompt here..."
      />
      <div className="mt-2 flex items-center h-6">
        {renderStatus()}
      </div>
    </div>
  );
};
