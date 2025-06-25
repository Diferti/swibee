import { Product } from '@shopify/shop-minis-react';
import { RotateCcw, Heart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DislikeTabProps {
  dislikedProducts: Product[];
  onReturnToSwiping: (productId: string) => void;
  onMoveToLiked: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export function DislikeTab({ 
  dislikedProducts, 
  onReturnToSwiping,
  onMoveToLiked,
}: DislikeTabProps) {
  return (
    <div className="px-4 pt-4">
      <h2 className="text-xl font-bold text-white text-center">Not Interested</h2>
      <p className="text-white/70 mb-4 text-center">Products you've passed on</p>

      {dislikedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-white/50">No disliked products</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dislikedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3 bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {product.featuredImage && (
                    <img
                      src={product.featuredImage.url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{product.title}</p>
                  <p className="text-white/70 text-sm">{product.price.amount}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onReturnToSwiping(product.id)}
                  className="p-1 text-white/70 hover:text-blue-400"
                  title="Return to swiping"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => onMoveToLiked(product.id)}
                  className="p-1 text-white/70 hover:text-green-400"
                  title="Move to liked"
                >
                  <Heart size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}