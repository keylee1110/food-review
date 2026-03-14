"use client";

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import FilterBar from './FilterBar';
import ReviewCard, { ReviewProps } from './ReviewCard';
import ReviewModal from './ReviewModal';

interface ReviewFeedProps {
  initialReviews: ReviewProps[];
}

export default function ReviewFeed({ initialReviews }: ReviewFeedProps) {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedReview, setSelectedReview] = useState<ReviewProps | null>(null);

  // Ensure we flatten and extract unique tags from all reviews
  const categories = Array.from(
    new Set(initialReviews.flatMap((review) => review.tags || []))
  );

  // Filter reviews based on active category
  const filteredReviews = activeCategory === 'Tất cả'
    ? initialReviews
    : initialReviews.filter((review) => (review.tags || []).includes(activeCategory));

  return (
    <div className="pt-6">
      <FilterBar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onClick={setSelectedReview}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedReview && (
          <ReviewModal
            review={selectedReview}
            onClose={() => setSelectedReview(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
