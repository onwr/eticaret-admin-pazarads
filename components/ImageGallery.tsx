import React from 'react';
import { ProductImage } from '../types';
import { Trash2, GripHorizontal, Eye } from 'lucide-react';

interface ImageGalleryProps {
  images: ProductImage[];
  onDelete: (id: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void; // Placeholder for DnD
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDelete }) => {
  if (images.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-gray-400">
         <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
           <Eye size={32} className="opacity-50" />
         </div>
         <p className="font-medium">No images uploaded</p>
         <p className="text-sm mt-1">Add images above to showcase this product.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((img, index) => (
        <div 
          key={img.id} 
          className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm aspect-square flex flex-col"
        >
          <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-grab active:cursor-grabbing">
             <GripHorizontal size={12} />
             <span>{index + 1}</span>
          </div>

          <div className="flex-1 overflow-hidden bg-gray-100 relative">
             <img 
               src={img.url} 
               alt={img.alt || 'Product image'} 
               className="w-full h-full object-cover transition-transform group-hover:scale-105" 
             />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
          </div>

          <div className="p-2 flex justify-end bg-white border-t border-gray-100">
             <button 
               onClick={() => onDelete(img.id)}
               className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
               title="Remove Image"
             >
               <Trash2 size={16} />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;