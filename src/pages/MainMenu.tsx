import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/NavBar';
import { useAsyncStorage, useProductSearch, ProductLink } from '@shopify/shop-minis-react';
import { useClearProfileStorage } from '../hooks/clearProfileData';

const CATEGORY_MAPPING: Record<string, string> = {
    "Clothing": "gid://shopify/TaxonomyCategory/aa-1`q",
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
      case 'male': return 'MALE';
      case 'female': return 'FEMALE';
      case 'neutral': return 'NEUTRAL';
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

  const { products, loading, error } = useProductSearch({
    query: '',
    filters: filter,
    skip: !isProfileReady || currentTab !== 'swiping'
  });

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
            <h2 className="text-xl font-bold text-white">Swipe Products</h2>
            <p className="text-white/70 mb-4">Discover items you might like</p>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-white">Loading products...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 rounded-lg p-4">
                <p className="text-red-500">Error: {error.message}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products?.length ? (
                  products.map((product) => (
                    <ProductLink key={product.id} product={product} />
                  ))
                ) : (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-white/50">No products found matching your preferences</p>
                  </div>
                )}
              </div>
            )}
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