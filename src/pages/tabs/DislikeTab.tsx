import { useState, useEffect, useMemo } from 'react';
import { ProductLink, useProducts } from '@shopify/shop-minis-react';
import { Product } from '@shopify/shop-minis-react';
import { useAsyncStorage } from '@shopify/shop-minis-react';

interface DislikeTabProps {
  dislikedProducts: Product[];
}

export function DislikeTab({ dislikedProducts }: DislikeTabProps) {
  const { getItem } = useAsyncStorage();
  const [localDislikedProducts, setLocalDislikedProducts] = useState<Product[]>([]);

  // Get product IDs from disliked products
  const productIds = useMemo(() => {
    return dislikedProducts.map((p) => p.id);
  }, [dislikedProducts]);

  const { products, loading, error } = useProducts({ ids: productIds });

  // Load disliked products from storage on mount
  useEffect(() => {
    const loadDislikedProducts = async () => {
      try {
        const disliked = await getItem({ key: 'dislikedProducts' });
        if (disliked) {
          setLocalDislikedProducts(JSON.parse(disliked));
        }
      } catch (error) {
        console.error('Error loading disliked products:', error);
      }
    };

    loadDislikedProducts();
  }, []);

  return (
    <div className="px-4 pt-4">
      <h2 className="text-xl font-bold text-white">Not Interested</h2>
      <p className="text-white/70 mb-4">Items you've passed on</p>

      {loading && <p className="text-white/70">Loading disliked products...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      <div className="grid grid-cols-2 gap-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden">
              <ProductLink product={product}/>
            </div>
          ))
        ) : (
          !loading && (
            <div className="col-span-2 flex items-center justify-center h-64">
              <p className="text-white/50">No disliked products yet</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}