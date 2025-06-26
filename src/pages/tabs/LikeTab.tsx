import { useState } from 'react';
import { Trash2, ShoppingCart, X, Check, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Product, 
  useProductVariants, 
  useShopCartActions,
  ProductVariant
} from '@shopify/shop-minis-react';

interface LikeTabProps {
  likedProducts: Product[];
  onDelete: (productId: string) => void;
}

interface CartItem {
  id: string;
  title: string;
  variantTitle: string;
  price: { amount: string };
  quantity: number;
  image?: { url: string } | null;
}

interface ExtendedProductVariant extends ProductVariant {
  selectedOptions?: {
    name: string;
    value: string;
  }[];
  title?: string;
  size?: string;
  color?: string;
}

export function LikeTab({ likedProducts, onDelete }: LikeTabProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const { variants, loading: variantsLoading } = useProductVariants({ 
    id: selectedProductId || '' 
  });

  const { addToCart } = useShopCartActions();

  const selectedProduct = likedProducts.find(p => p.id === selectedProductId);

  const getVariantDisplayName = (variant: ExtendedProductVariant): string => {
    // First try selectedOptions if available
    if (variant.selectedOptions && variant.selectedOptions.length > 0) {
      return variant.selectedOptions.map(opt => opt.value).join(' / ');
    }
    
    // Then try specific properties
    if (variant.title && variant.title !== 'Default Title') return variant.title;
    if (variant.size) return variant.size;
    if (variant.color) return variant.color;
    
    // Fallback to variant ID if nothing else works
    return 'Variant ' + variant.id.slice(0, 4);
  };

  const handleAddToCart = async () => {
    if (!selectedProductId || !selectedVariantId || !selectedProduct) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: selectedProductId,
        productVariantId: selectedVariantId,
        quantity: quantity
      });
      
      // Update our local cart state
      const variant = variants?.find(v => v.id === selectedVariantId) as ExtendedProductVariant;
      const newItem: CartItem = {
        id: selectedVariantId,
        title: selectedProduct.title,
        variantTitle: variant ? getVariantDisplayName(variant) : 'Default',
        price: selectedProduct.price,
        quantity: quantity,
        image: selectedProduct.featuredImage
      };
      
      setCartItems(prev => [...prev, newItem]);
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedProductId(null);
        setSelectedVariantId(null);
        setQuantity(1);
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCheckout = () => {
    setShowThankYou(true);
    setTimeout(() => {
      setShowCart(false);
      setShowThankYou(false);
      setCartItems([]);
    }, 2000);
  };

  const closeModal = () => {
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setQuantity(1);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="px-4 pt-4 relative min-h-screen pb-20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Liked Products</h2>
          <p className="text-white/70">Your saved favorites</p>
        </div>
        <button 
          onClick={() => setShowCart(true)}
          className="relative p-2 text-white hover:bg-white/10 rounded-full"
        >
          <ShoppingCart size={24} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Variant Selection Modal */}
      <AnimatePresence>
        {selectedProductId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-55 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select Options</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              {selectedProduct?.featuredImage && (
                <div className="mb-4">
                  <img
                    src={selectedProduct.featuredImage.url}
                    alt={selectedProduct.title}
                    className="w-full h-48 object-contain rounded-lg"
                  />
                </div>
              )}
              
              <h4 className="text-lg font-semibold mb-2">{selectedProduct?.title}</h4>
              <p className="text-gray-700 mb-4">${selectedProduct?.price.amount}</p>

              {variantsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h5 className="font-medium mb-3">Available Options</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {variants?.map(variant => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`py-2 px-1 border rounded-md text-sm ${
                            selectedVariantId === variant.id 
                              ? 'border-highlight bg-highlight/20 text-highlight' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {getVariantDisplayName(variant as ExtendedProductVariant)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className="font-medium mb-3">Quantity</h5>
                    <div className="flex items-center border border-gray-200 rounded-md w-fit">
                      <button 
                        onClick={decrementQuantity}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-1 border-x border-gray-200">
                        {quantity}
                      </span>
                      <button 
                        onClick={incrementQuantity}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariantId || isAddingToCart}
                    className={`w-full py-3 rounded-md font-medium ${
                      !selectedVariantId 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-highlight text-white hover:bg-highlight/70'
                    }`}
                  >
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {showThankYou ? (
                <div className="text-center py-8">
                  <Check size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Thank you for your order!</h3>
                  <p className="text-gray-500">Your items will be processed shortly</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Your Cart ({cartItemCount})</h3>
                    <button 
                      onClick={() => setShowCart(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  {cartItemCount === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 border-b pb-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            {item.image && (
                              <img
                                src={item.image.url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.variantTitle}</p>
                            <p className="text-gray-800 font-medium">${item.price.amount} × {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleCheckout}
                        className="w-full py-3 rounded-md font-medium bg-highlight text-white hover:bg-highlight/70 mt-4"
                      >
                        Add to Checkout
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <Check size={18} />
            <span>Added to cart successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {likedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-white/50">No liked products yet</p>
        </div>
      ) : (
        <div className="space-y-2 pb-16">
          {likedProducts.map((product) => (
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
                  <p className="text-white/70 text-sm">${product.price.amount}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(product.id)}
                  className="p-1 text-white/70 hover:text-red-400"
                  title="Remove from liked"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setSelectedProductId(product.id)}
                  className="p-1 text-white/70 hover:text-green-400"
                  title="Add to cart"
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