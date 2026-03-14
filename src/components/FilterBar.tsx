import { motion } from "framer-motion";

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function FilterBar({ categories, activeCategory, onSelectCategory }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-6 flex overflow-x-auto bg-black/80 px-4 py-4 backdrop-blur-xl scrollbar-hide">
      <div className="flex gap-2">
        <button
          onClick={() => onSelectCategory('Tất cả')}
          className={`relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            activeCategory === 'Tất cả' ? 'text-black' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {activeCategory === 'Tất cả' && (
            <motion.div
              layoutId="active-filter"
              className="absolute inset-0 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">Tất cả</span>
        </button>

        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              activeCategory === category ? 'text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {activeCategory === category && (
              <motion.div
                layoutId="active-filter"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
