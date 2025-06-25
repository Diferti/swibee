import { LikeProduct } from '../../components/LikeProduct';

export function LikeTab({ likedProducts }) {
  const handleDelete = (productId) => {
    // Remove from liked products
  };

  const handleAddToCart = (productId) => {
    // Add to cart logic
  };

  const handleLike = (productId) => {
    // Additional like action if needed
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {likedProducts.map(product => (
        <LikeProduct
          key={product.id}
          product={product}
          onDelete={handleDelete}
          onAddToCart={handleAddToCart}
          onLike={handleLike}
        />
      ))}
    </div>
  );
}