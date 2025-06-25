import { Product } from '@shopify/shop-minis-react';
import { Trash2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LikeTabProps {
  likedProducts: Product[];
}

export function LikeTab({ likedProducts }: LikeTabProps) {
  const handleDelete = (productId: string) => {
    // This should be handled in the parent component
    console.log('Delete product:', productId);
  };

  const handleAddToCart = (productId: string) => {
    // This should be handled in the parent component
    console.log('Add to cart:', productId);
  };

  return (
    <div className="px-4 pt-4">
      <h2 className="text-xl font-bold text-white">Liked Products</h2>
      <p className="text-white/70 mb-4">Your saved favorites</p>

      {likedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-white/50">No liked products yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {likedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg"
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
                  onClick={() => handleDelete(product.id)}
                  className="p-1 text-white/70 hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="p-1 text-white/70 hover:text-green-400"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}