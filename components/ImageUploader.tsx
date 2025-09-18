import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Spinner } from './Spinner';

interface ImageUploaderProps {
  onImageSelect: (files: File[]) => void;
  onProcessImage: () => void;
  isLoading: boolean;
  error: string | null;
  imageFileCount: number;
  processingStatus: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelect, 
  onProcessImage, 
  isLoading, 
  error,
  imageFileCount,
  processingStatus
}) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clear previews if the file list is cleared from parent after processing
    if (imageFileCount === 0) {
      setImagePreviews([]);
    }
  }, [imageFileCount]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onImageSelect(fileArray);

      // Generate previews
      const previewPromises = fileArray.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previewPromises)
        .then(previews => setImagePreviews(previews))
        .catch(console.error);
        
    } else {
      onImageSelect([]);
      setImagePreviews([]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-gray-400 p-4">
          <div className="flex items-center justify-center">
             <Spinner />
             <span className="text-lg ml-2">Processing...</span>
          </div>
          <p className="mt-4 text-sm break-all">{processingStatus || 'Initializing...'}</p>
        </div>
      );
    }
    if (imagePreviews.length > 0) {
        return (
             <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-80">
                {imagePreviews.map((src, index) => (
                    <div key={index} className="aspect-square bg-brand-dark rounded-md overflow-hidden">
                        <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className="text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">Click to select images</p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP | Multiple files supported</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-white">1. Upload Image(s)</h2>
      
      <div 
        className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg bg-brand-dark/50 hover:border-brand-primary transition-colors"
        onClick={imagePreviews.length === 0 && !isLoading ? handleUploadClick : undefined}
        style={{ cursor: imagePreviews.length === 0 && !isLoading ? 'pointer' : 'default' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          multiple
        />
        {renderContent()}
      </div>
      
      {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
         <Button 
          onClick={handleUploadClick}
          variant="secondary"
          disabled={isLoading}
        >
          {imageFileCount > 0 ? 'Change Selection' : 'Select Images'}
        </Button>
        <Button 
          onClick={onProcessImage}
          disabled={imageFileCount === 0 || isLoading}
        >
          {isLoading ? (
            'Processing...'
          ) : `Process ${imageFileCount} Image${imageFileCount !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
};