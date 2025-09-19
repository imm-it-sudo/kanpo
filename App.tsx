import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DataTable } from './components/DataTable';
import { PromptEditor } from './components/PromptEditor';
import type { ExtractedData } from './types';
import { extractDataFromImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

// A new local component to handle API Key input without creating a new file.
interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}
const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2 text-white">Gemini API Key</h2>
      <p className="text-sm text-gray-400 mb-3">
        Your API key is stored locally in your browser and is required to process images.
      </p>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        className="w-full p-3 bg-brand-dark border border-gray-600 rounded-md text-gray-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
        placeholder="Enter your Gemini API Key here"
        aria-label="Gemini API Key"
      />
    </div>
  );
};

const DEFAULT_PROMPT = `### Role
You are a highly specialized data extraction AI. Your expertise is in analyzing images or text from the Japanese Official Gazette (Kanpo) and extracting structured information based on a strict set of rules known as "データAの詳細仕様" (Data A Detailed Specifications).
 
### Goal
Your primary goal is to identify public announcements within the provided Kanpo content, extract all relevant data points with 100% accuracy, and format the output as a single JSON object with Japanese field names.
 
### Core Instructions
1.  You will be given content from a Kanpo page.
2.  Scan the content to identify target announcements by matching their titles with a known list of keywords (e.g., 決算公告, 破産手続開始, 解散公告).
3.  For each identified announcement, you must extract the data fields listed below, following their specific formatting rules.
4.  If a specific piece of information cannot be found for a field, use \`null\` as its value.
5.  Pay close attention to detail, especially regarding date conversions, character width conversions, and specific code lookups.
 
### Detailed Field Extraction Rules
* **掲載日 (Publication Date):** Find the main publication date of the gazette. Convert the Japanese Era (e.g., 令和) to a Western year and format as \`YYYYMMDD\`.
* **掲載頁 (Publication Page):** Extract the page number. If the gazette is a \`号外\` (Extra), prefix the number with "G". Otherwise, use the number only. If not visible, use \`null\`.
* **法人名・氏名 (Company/Individual Name):** Extract the full company or individual name. If not present, use \`null\`.
* **内容要約 (Summary Column):** Use the standardized title of the announcement (e.g., \`決算公告\`, \`破産手続開始\`).
* **記事本文（全角） (Article - Full-width):** Extract the *entire* text content within the announcement's border. **Crucially, you must convert all half-width (hankaku) alphanumeric characters and symbols to their full-width (zenkaku) equivalents.**
* **データ区分 (Data Classification):** Based on the \`内容要約\`, assign the correct 2-digit code. (e.g., \`決算公告\` -> \`01\`, \`破産手続開始\` -> \`16\`).
* **効力発生日 (Effective Date):** Find the effective or decision date *within* the article text. Format it as \`YYYYMMDD\`. If not present, use the \`掲載日\`.
* **法人格コード (Legal Entity Code):** Based on the legal entity type (e.g., \`株式会社\`), assign the corresponding code (e.g., \`01\`). If not applicable, use \`null\`.
* **法人格位置 (Legal Entity Position):** If the entity type appears *before* the name, use \`1\`. If it appears *after*, use \`2\`. If \`法人格コード\` is \`null\`, this must also be \`null\`.
* **官報種別 (Kanpo Type):** If the gazette has a numbered issue (\`第...号\`), it is \`本紙\`, so use \`H\`. If it is \`号外\`, use \`G\`. If not visible, use \`null\`.
* **官報号数 (Kanpo Issue Number):** Extract the numerical issue number. If not visible, use \`null\`.
* **代表者名（スペースあり） (Representative Name w/ Space):** Extract the representative's name exactly as it appears. Do not include their title. If not present, use \`null\`.
* **代表者名（スペースなし） (Representative Name w/o Space):** Same as above, but remove the space between names. If not present, use \`null\`.
* **住所 (Address):** Extract the full address of the company/individual. If not present, use \`null\`.
* **事件番号 (Case Number):** For announcements related to legal proceedings (e.g., \`破産手続\`), extract the case number. If not present, use \`null\`.
 
### Output Format
You must provide the extracted data in a single JSON object. Use the Japanese field names specified below.
{
  "掲載日": "YYYYMMDD",
  "掲載頁": "string or null",
  "法人名・氏名": "string or null",
  "内容要約": "string",
  "記事本文（全角）": "string",
  "データ区分": "string",
  "効力発生日": "YYYYMMDD",
  "法人格コード": "string or null",
  "法人格位置": "string or null",
  "官報種別": "string or null",
  "官報号数": "string or null",
  "代表者名（スペースあり）": "string or null",
  "代表者名（スペースなし）": "string or null",
  "住所": "string or null",
  "事件番号": "string or null"
}`;

const App: React.FC = () => {
  const [extractedData, setExtractedData] = useState<ExtractedData[]>(() => {
    try {
      const savedData = localStorage.getItem('extracted_data');
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Failed to parse saved data from localStorage", error);
      return [];
    }
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [prompt, setPrompt] = useState<string>(() => localStorage.getItem('gemini_custom_prompt') || DEFAULT_PROMPT);

  useEffect(() => {
    localStorage.setItem('extracted_data', JSON.stringify(extractedData));
  }, [extractedData]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    localStorage.setItem('gemini_custom_prompt', newPrompt);
  };

  const handleProcessImage = useCallback(async () => {
    if (!apiKey) {
      setError('Please enter your Gemini API Key first.');
      return;
    }
    if (imageFiles.length === 0) {
      setError('Please select one or more image files first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessingStatus('Starting processing...');

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        setProcessingStatus(`Processing ${i + 1}/${imageFiles.length}: ${file.name}`);
        const base64Image = await fileToBase64(file);
        const mimeType = file.type;

        const result = await extractDataFromImage(apiKey, base64Image, mimeType, prompt);

        const newData: ExtractedData = {
          id: Date.now() + i, // Add index to ensure unique ID in batch
          imageName: file.name,
          data: result,
        };

        setExtractedData(prevData => [...prevData, newData]);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to process ${file.name}: ${errorMessage}`);
        console.error(`Failed to process ${file.name}:`, err);
        // Continue to the next file
      }
    }
    
    setIsLoading(false);
    setProcessingStatus(null);
    setImageFiles([]); // Clear selection after processing
    
  }, [imageFiles, prompt, apiKey]);

  const handleDownloadCsv = useCallback(() => {
    if (extractedData.length === 0) {
      alert("No data to download.");
      return;
    }
    
    const allKeys = new Set<string>();
    extractedData.forEach(entry => {
        Object.keys(entry.data).forEach(key => allKeys.add(key));
    });
    
    const sortedKeys = Array.from(allKeys).sort();
    const headers = ['id', 'imageName', ...sortedKeys];
    
    let csvContent = headers.join(',') + '\n';

    extractedData.forEach(entry => {
        const row = [
            entry.id,
            `"${entry.imageName.replace(/"/g, '""')}"`,
            ...sortedKeys.map(key => {
                const value = entry.data[key] ?? ''; // Use ?? to handle null correctly
                return `"${String(value).replace(/"/g, '""')}"`;
            })
        ];
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-s-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'extracted_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  }, [extractedData]);

  const handleClearData = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all extracted data? This action cannot be undone.")) {
      setExtractedData([]);
      setSelectedRows([]);
    }
  }, []);
  
  const handleDeleteRow = useCallback((idToDelete: number) => {
    setExtractedData(prevData => prevData.filter(item => item.id !== idToDelete));
    setSelectedRows(prev => prev.filter(id => id !== idToDelete));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected row(s)?`)) {
      setExtractedData(prevData => prevData.filter(item => !selectedRows.includes(item.id)));
      setSelectedRows([]);
    }
  }, [selectedRows]);
  
  const handleSelectionChange = useCallback((id: number | 'all', checked: boolean) => {
    if (id === 'all') {
      setSelectedRows(checked ? extractedData.map(item => item.id) : []);
    } else {
      setSelectedRows(prev => 
        checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
      );
    }
  }, [extractedData]);

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <div className="bg-brand-gray p-6 rounded-xl shadow-lg border border-gray-700">
              <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
            </div>
            <div className="bg-brand-gray p-6 rounded-xl shadow-lg border border-gray-700">
              <ImageUploader 
                onImageSelect={setImageFiles}
                onProcessImage={handleProcessImage}
                isLoading={isLoading}
                error={error}
                imageFileCount={imageFiles.length}
                processingStatus={processingStatus}
              />
            </div>
            <div className="bg-brand-gray p-6 rounded-xl shadow-lg border border-gray-700">
              <PromptEditor prompt={prompt} onPromptChange={handlePromptChange} />
            </div>
          </div>
          <div className="bg-brand-gray p-6 rounded-xl shadow-lg border border-gray-700">
            <DataTable 
              data={extractedData} 
              onDownloadCsv={handleDownloadCsv}
              onClearData={handleClearData}
              onDeleteRow={handleDeleteRow}
              selectedRows={selectedRows}
              onSelectionChange={handleSelectionChange}
              onDeleteSelected={handleDeleteSelected}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;