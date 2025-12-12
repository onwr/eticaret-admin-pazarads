
import React from 'react';
import { ProductReview } from '../../types';
import { Star, CheckCircle } from 'lucide-react';

interface ReviewSectionProps {
  reviews: ProductReview[];
  themeColor?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, themeColor = '#3B82F6' }) => {
  if (reviews.length === 0) return null;

  return (
    <div className="bg-gray-50 py-12 rounded-2xl my-8">
      <div className="px-6">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Müşteri Değerlendirmeleri
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{review.comment}"</p>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="font-bold text-gray-900">{review.author}</span>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle size={12} /> Onaylı Satın Alım
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;