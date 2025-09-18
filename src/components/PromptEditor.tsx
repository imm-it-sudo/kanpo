import React from 'react';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onPromptChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Custom Instruction Prompt</h2>
      <p className="text-sm text-gray-400 mb-3">
        Modify the prompt to guide the AI on how to extract data from your image.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="w-full h-48 p-3 bg-brand-dark border border-gray-600 rounded-md text-gray-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
        aria-label="Custom Instruction Prompt"
        placeholder="Enter your custom prompt here..."
      />
      <p className="text-xs text-gray-500 mt-2">
        Your prompt is saved automatically in your browser.
      </p>
    </div>
  );
};