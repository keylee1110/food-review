import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ReviewProps {
  _id: string;
  title: string;
  location: string;
  rating: number;
  thumbnailUrl: string;
  tags: string[];
  content?: any[];
  googleMapsUrl?: string;
  gallery?: string[];
}

interface ReviewCardProps {
  review: ReviewProps;
  onClick: (review: ReviewProps) => void;
}

export default function ReviewCard({ review, onClick }: ReviewCardProps) {
  return (
    <motion.div
      layoutId={`card-container-${review._id}`}
      onClick={() => onClick(review)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#111] p-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      whileHover={{ y: -5 }}
    >
      {/* Aspect ratio container for image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-900">
        <motion.div layoutId={`card-image-${review._id}`} className="h-full w-full">
          <Image
            src={review.thumbnailUrl || '/placeholder.jpg'}
            alt={review.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
        
        {/* Gradient Overlay for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-sm font-medium backdrop-blur-md">
          <Star className="h-3.5 w-3.5 fill-white text-white" />
          <span>{review.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-4 px-1 pb-1">
        <motion.h3 
          layoutId={`card-title-${review._id}`}
          className="text-lg font-bold tracking-tight text-white line-clamp-1"
        >
          {review.title}
        </motion.h3>
        <div className="mt-1 flex items-center text-sm text-neutral-400">
          <MapPin className="mr-1 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{review.location}</span>
        </div>
      </div>
    </motion.div>
  );
}
