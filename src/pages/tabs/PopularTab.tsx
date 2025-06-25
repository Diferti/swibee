import { usePopularProducts, ProductCard } from '@shopify/shop-minis-react';

export function PopularTab() {
  const { products, loading, error } = usePopularProducts();

  return (
    <div className="px-2 pt-4">
      <h2 className="text-xl font-bold text-white text-center">Popular Products</h2>
      <p className="text-white/70 mb-4 text-center">Trending items this week</p>
      
      <div className="p-2 space-y-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
        {loading && <p className="text-white/80">Loading products...</p>}
        {error && <p className="text-red-400">Error: {error.message}</p>}

        <div className="grid grid-cols-2 gap-4">
          {(products && products.length > 0 ? products : []).map(
            (product) => (
                <div className='bg-white/30 backdrop-blur-lg border border-white rounded-2xl p-1'>
                    <ProductCard key={product.id} product={product} />
                </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}