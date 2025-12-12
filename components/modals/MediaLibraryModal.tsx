import React from 'react';
import { X } from 'lucide-react';
import MediaLibrary from '../MediaLibrary';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    initialCategory?: 'products' | 'upsells' | 'reviews' | 'general';
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ isOpen, onClose, onSelect, initialCategory }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-900">Medya Kütüphanesi</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden p-0">
                    <MediaLibrary
                        onSelect={(url) => {
                            onSelect(url);
                            onClose();
                        }}
                        initialCategory={initialCategory}
                        className="h-full border-0 rounded-none shadow-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default MediaLibraryModal;
