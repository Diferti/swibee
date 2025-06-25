import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon, XIcon } from 'lucide-react';
import type { Product } from '@shopify/shop-minis-react';
import { useProduct } from '@shopify/shop-minis-react';

interface SwipeTabProps {
  products: Product[];
  loading: boolean;
  error?: Error | null;
  onSwipeLeft: (productId: string) => void;
  onSwipeRight: (productId: string) => void;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  onViewDetails: (productId: string) => void;
}

export function SwipeTab({
  products,
  loading,
  error,
  onSwipeLeft,
  onSwipeRight,
  onEndReached,
  isLoadingMore,
  onViewDetails,
}: SwipeTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState<string | number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const endReachedRef = useRef(false);

  const currentProduct = products[currentIndex];

  const handleViewDetails = useCallback(() => {
    if (!currentProduct) return;
    onViewDetails(currentProduct.id);
  }, [currentProduct, onViewDetails]);

  // Check if we need to load more products when nearing the end
  useEffect(() => {
    if (
      products.length > 0 &&
      currentIndex >= products.length - 3 && 
      onEndReached && 
      !endReachedRef.current &&
      !isLoadingMore
    ) {
      endReachedRef.current = true;
      onEndReached();
    }
  }, [currentIndex, products.length, onEndReached, isLoadingMore]);

  // Reset end reached flag when new products are loaded
  useEffect(() => {
    if (products.length > 0) {
      endReachedRef.current = false;
    }
  }, [products.length]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || !currentProduct) return;
    
    setIsAnimating(true);
    setExitX(direction === 'left' ? -500 : 500);
    
    setTimeout(() => {
      if (direction === 'left') {
        onSwipeLeft(currentProduct.id);
      } else {
        onSwipeRight(currentProduct.id);
      }
      setCurrentIndex(prev => prev + 1);
      setExitX(0);
      setIsAnimating(false);
    }, 300);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isAnimating]);

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-white">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 rounded-lg p-4">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  if (!products.length || currentIndex >= products.length) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-center p-4">
        <h3 className="text-xl font-bold text-white mb-2">No more products</h3>
        <p className="text-white/70">We've run out of products matching your preferences.</p>
        <p className="text-white/70">Try adjusting your filters or check back later!</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[500px]">
      {/* Product cards */}
      <AnimatePresence>
        {currentProduct && (
          <motion.div
            key={currentProduct.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (isAnimating) return;
              
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                handleSwipe('left');
              } else if (swipe > 10000) {
                handleSwipe('right');
              }
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
            }}
            exit={{
              x: exitX,
              opacity: 0,
              scale: 0.8,
              transition: { duration: 0.2 }
            }}
            className="absolute top-0 left-0 right-0 bg-white rounded-2xl shadow-xl overflow-hidden h-[500px]"
          >
            {/* Product Image - Now larger */}
            <div className="h-[70%] bg-gray-100 relative overflow-hidden">
              {currentProduct.featuredImage ? (
                <img 
                  src={currentProduct.featuredImage.url} 
                  alt={currentProduct.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="p-4 h-[30%] flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg line-clamp-2">{currentProduct.title}</h3>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-lg">
                    ${currentProduct.price.amount}
                  </span>
                  {currentProduct.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${currentProduct.compareAtPrice.amount}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                {currentProduct.shop.name}
              </p>
              
              <div className="mt-auto flex justify-between items-center">
                {/* Always show rating container */}
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  {currentProduct.reviewAnalytics?.averageRating ? (
                    <>
                      <span className="font-bold text-sm">
                        {currentProduct.reviewAnalytics.averageRating.toFixed(1)}
                      </span>
                      <span className="text-yellow-400">★</span>
                      <span className="text-xs text-gray-500">
                        ({currentProduct.reviewAnalytics.reviewCount || 0})
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No ratings</span>
                  )}
                </div>
                
                <button 
                  onClick={handleViewDetails}
                  className="text-sm text-blue-600 font-medium hover:text-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons - moved up with margin */}
      <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-8 z-10 mt-4">
        <button 
          onClick={() => handleSwipe('left')}
          className="bg-white/15 backdrop-blur-lg border border-white/30 transition-colors p-4 rounded-full shadow-lg hover:bg-white/25"
          disabled={isAnimating}
        >
          <XIcon className="text-red-600 w-8 h-8" />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="bg-white/15 backdrop-blur-lg border border-white/30 transition-colors p-4 rounded-full shadow-lg hover:bg-white/25"
          disabled={isAnimating}
        >
          <HeartIcon className="text-green-500 w-8 h-8" />
        </button>
      </div>

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center">
          <div className="bg-white/80 text-black px-4 py-2 rounded-full text-sm">
            Loading more products...
          </div>
        </div>
      )}
    </div>
  );
}