import React from 'react';
import { ProductReview } from '../types';
import { Star, Edit2, Trash2, User } from 'lucide-react';

interface ReviewCardProps {
  review: ProductReview;
  onEdit: (review: ProductReview) => void;
  onDelete: (review: ProductReview) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, onDelete }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 transition-all
       ${review.isActive ? 'border-gray-100' : 'border-red-100 bg-red-50/10'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
             <User size={20} />
           </div>
           <div>
             <h4 className="font-bold text-gray-900 text-sm">{review.author}</h4>
             <span className="text-xs text-gray-400">
               {new Date(review.createdAt).toLocaleDateString()}
             </span>
           </div>
        </div>
        <div className="flex items-center gap-1">
           {/* Actions */}
           <button 
             onClick={() => onEdit(review)}
             className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
           >
             <Edit2 size={16} />
           </button>
           <button 
             onClick={() => onDelete(review)}
             className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
           >
             <Trash2 size={16} />
           </button>
        </div>
      </div>

      <div className="flex mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            className={`${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
          />
        ))}
      </div>

      <p className="text-gray-600 text-sm leading-relaxed mb-3">
        {review.comment}
      </p>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
         <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            review.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
         }`}>
           {review.isActive ? 'Published' : 'Hidden'}
         </span>
      </div>
    </div>
  );
};

export default ReviewCard;