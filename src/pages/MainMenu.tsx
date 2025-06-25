import { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAsyncStorage, useProductSearch, Product } from '@shopify/shop-minis-react';
import { useClearProfileStorage } from '../hooks/clearProfileData';
import { SwipeTab } from './tabs/SwipeTab';

const CATEGORY_MAPPING: Record<string, string> = {
  "Clothing": "gid://shopify/TaxonomyCategory/aa-1",
  "Electronics": "gid://shopify/TaxonomyCategory/el",
  "Beauty": "gid://shopify/TaxonomyCategory/hb",
  "Accessories": "gid://shopify/TaxonomyCategory/aa",
  "Home": "gid://shopify/TaxonomyCategory/hg",
  "Baby & Toddler": "gid://shopify/TaxonomyCategory/bt",
  "Food & Drink": "gid://shopify/TaxonomyCategory/fb",
  "Fitness & Nutrition": "gid://shopify/TaxonomyCategory/hb-1-9",
  "Toys & Games": "gid://shopify/TaxonomyCategory/tg",
  "Art & Crafts": "gid://shopify/TaxonomyCategory/ae-2-1",
  "Luggage & Bags": "gid://shopify/TaxonomyCategory/lb",
  "Sporting Goods": "gid://shopify/TaxonomyCategory/sg",
};

export default function MainPage() {
  const [currentTab, setCurrentTab] = useState('swiping');
  const { clearProfileData } = useClearProfileStorage();
  const { getItem } = useAsyncStorage();
  const [gender, setGender] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const retrieveProfileData = async () => {
      try {
        const g = await getItem({ key: 'gender' });
        const c = await getItem({ key: 'categories' });
        setGender(g ?? '');
        setCategories(c ? JSON.parse(c) : []);
        setIsProfileReady(true);
      } catch (error) {
        console.error('Error retrieving profile data:', error);
      }
    };

    retrieveProfileData();
  }, []);

  const getGenderFilter = (gender: string): 'MALE' | 'FEMALE' | 'NEUTRAL' | undefined => {
    switch (gender) {
      case 'Male': return 'MALE';
      case 'Female': return 'FEMALE';
      case 'Other': return 'NEUTRAL';
      default: return undefined;
    }
  };

  const filter = useMemo(() => {
    if (!isProfileReady || currentTab !== 'swiping') return undefined;
    
    const categoryIds = categories
      .map(category => CATEGORY_MAPPING[category] || category)
      .filter(Boolean);

    return {
      gender: getGenderFilter(gender),
      category: categoryIds.length > 0 ? categoryIds : undefined,
    };
  }, [isProfileReady, currentTab, gender, categories]);

  const { products, loading, error, hasNextPage, fetchMore } = useProductSearch({
    query: '',
    filters: filter,
    skip: !isProfileReady || currentTab !== 'swiping',
    first: 20
  });

  useEffect(() => {
    if (products?.length) {
      setAllProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newProducts = products.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
    }
  }, [products]);

  useEffect(() => {
    if (currentTab === 'swiping') {
      setAllProducts([]);
    }
  }, [filter, currentTab]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasNextPage || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      await fetchMore();
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, fetchMore, isLoadingMore]);

  const renderContent = () => {
    switch (currentTab) {
      case 'popular':
        return (
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold text-white">Popular Products</h2>
            <p className="text-white/70 mb-4">Trending items this week</p>
            <div className="flex items-center justify-center h-64">
              <p className="text-white/50">Popular products will appear here</p>
            </div>
          </div>
        );
      
      case 'notInterested':
        return (
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold text-white">Not Interested</h2>
            <p className="text-white/70 mb-4">Items you've passed on</p>
            <div className="flex items-center justify-center h-64">
              <p className="text-white/50">Rejected products will appear here</p>
            </div>
          </div>
        );
      
      case 'swiping':
        return (
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold text-white text-center">Swibee: Swipe with Vibe</h2>
            <p className="text-white/70 mb-4 text-center">
                Swipe. Shop. Smile.
            </p>
            
            <SwipeTab 
              products={allProducts}
              loading={loading && allProducts.length === 0}
              error={error}
              onSwipeLeft={(productId) => console.log('Not interested:', productId)}
              onSwipeRight={(productId) => console.log('Liked:', productId)}
              onEndReached={loadMoreProducts}
              isLoadingMore={isLoadingMore}
            />
          </div>
        );
      
      case 'liked':
        return (
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold text-white">Liked Products</h2>
            <p className="text-white/70 mb-4">Items you've saved</p>
            <div className="flex items-center justify-center h-64">
              <p className="text-white/50">Liked products will appear here</p>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold text-white">Your Profile</h2>
            <p className="text-white/70 mb-4">Manage your preferences</p>
            
            <div className="bg-white/10 rounded-xl p-6 mb-4">
              <h3 className="font-semibold text-white mb-2">Gender</h3>
              <p className="text-white/80">{gender || 'Not specified'}</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">Interests</h3>
              {categories.length > 0 ? (
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category} className="text-white/80">
                      {category}
                      {CATEGORY_MAPPING[category] && (
                        <span className="text-white/50 text-xs block mt-1">
                          ID: {CATEGORY_MAPPING[category]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/50">No interests selected</p>
              )}
            </div>
            <button 
              onClick={clearProfileData} 
              className="bg-red-500 hover:bg-red-600 transition-colors text-white px-4 py-2 rounded mt-4"
            >
              Reset Profile Data
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5436CA] via-[#664BD8] to-[#7B64EA] pb-32">
      {renderContent()}
      <Navbar currentTab={currentTab} onChange={setCurrentTab} />
    </div>
  );
}