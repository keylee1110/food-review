import { motion } from 'framer-motion';
import { X, MapPin, ExternalLink, Star } from 'lucide-react';
import Image from 'next/image';
import { ReviewProps } from './ReviewCard';
import { PortableText } from '@portabletext/react';

interface ReviewModalProps {
  review: ReviewProps | null;
  onClose: () => void;
}

export default function ReviewModal({ review, onClose }: ReviewModalProps) {
  if (!review) return null;

  return (
    <>
      {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

      {/* Modal / Bottom Sheet */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-t-3xl bg-[#111] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      >
            {/* Header/Image Area */}
            <div className="relative aspect-video w-full shrink-0">
              <motion.div layoutId={`card-image-${review._id}`} className="h-full w-full">
            <Image
              src={review.thumbnailUrl || '/placeholder.jpg'}
              alt={review.title}
              fill
              priority
              className="object-cover"
            />
              </motion.div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="flex items-start justify-between gap-4">
                <motion.h2 
                  layoutId={`card-title-${review._id}`}
                  className="text-2xl font-bold text-white leading-tight"
                >
                  {review.title}
                </motion.h2>
                <div className="flex items-center gap-1 shrink-0 rounded-full bg-neutral-800 px-3 py-1.5 font-medium">
                  <Star className="h-4 w-4 fill-white text-white" />
                  <span>{review.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center text-neutral-400">
                <MapPin className="mr-1.5 h-4 w-4" />
                <span>{review.location}</span>
              </div>

              {/* Image Gallery */}
              {review.gallery && review.gallery.length > 0 && (
                <div className="-mx-6 mt-6 flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide">
                  {review.gallery.map((url, index) => (
                    <div key={index} className="relative aspect-square h-32 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={url}
                        alt={`${review.title} gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Review Content */}
              <div className="prose prose-invert mt-6 max-w-none">
                {review.content ? (
                  <div className="text-neutral-300 leading-relaxed">
                    <PortableText value={review.content} />
                  </div>
                ) : (
                   <p className="text-neutral-500 italic">Chưa có bài đánh giá chi tiết.</p>
                )}
              </div>
            </div>

            {/* Sticky Footer CTA */}
            <div className="shrink-0 border-t border-neutral-800 bg-[#111] p-4 pb-8 sm:pb-4">
              <a
                href={review.googleMapsUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                  review.googleMapsUrl 
                    ? "bg-white text-black" 
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                {review.googleMapsUrl ? "Mở trong Google Maps" : "Không có địa điểm Maps"}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
      </motion.div>
    </>
  );
}
