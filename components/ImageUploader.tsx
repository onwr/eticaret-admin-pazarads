import React, { useState } from 'react';
import { Upload, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (url: string) => Promise<void>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAdd = async () => {
    if (!url.trim()) return;
    setIsUploading(true);
    try {
      await onUpload(url);
      setUrl('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const addRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    setUrl(`https://picsum.photos/seed/${randomId}/600/600`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Upload size={18} />
        Add New Image
      </h3>
      
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
           <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
              type="text" 
              placeholder="Enter image URL..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
           />
        </div>
        <button 
          onClick={addRandomImage}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Generate Random
        </button>
        <button 
          onClick={handleAdd}
          disabled={isUploading || !url.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          Add Image
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Since this is a demo without backend storage, please provide a direct image URL or generate a random one.
      </p>
    </div>
  );
};

export default ImageUploader;