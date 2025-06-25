import { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAsyncStorage, useProductSearch, Product } from '@shopify/shop-minis-react';
import { SwipeTab } from './tabs/SwipeTab';
import { PopularTab } from './tabs/PopularTab';
import { ProfileTab } from './tabs/ProfileTab';
import { LikeTab } from './tabs/LikeTab';
import { DislikeTab } from './tabs/DislikeTab';

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
  const { getItem, setItem } = useAsyncStorage();
  const [gender, setGender] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [dislikedProducts, setDislikedProducts] = useState<Product[]>([]);

  // Load initial data from storage
  useEffect(() => {
    const retrieveProfileData = async () => {
      try {
        const g = await getItem({ key: 'gender' });
        const c = await getItem({ key: 'categories' });
        const liked = await getItem({ key: 'likedProducts' });
        const disliked = await getItem({ key: 'dislikedProducts' });

        setGender(g ?? '');
        setCategories(c ? JSON.parse(c) : []);
        setLikedProducts(liked ? JSON.parse(liked) : []);
        setDislikedProducts(disliked ? JSON.parse(disliked) : []);
        setIsProfileReady(true);
      } catch (error) {
        console.error('Error retrieving profile data:', error);
      }
    };

    retrieveProfileData();
  }, []);

  // Save liked/disliked products to storage whenever they change
  useEffect(() => {
    const saveProducts = async () => {
      try {
        await setItem({ key: 'likedProducts', value: JSON.stringify(likedProducts) });
        await setItem({ key: 'dislikedProducts', value: JSON.stringify(dislikedProducts) });
      } catch (error) {
        console.error('Error saving products:', error);
      }
    };

    saveProducts();
  }, [likedProducts, dislikedProducts]);

  // Get excluded product IDs (liked + disliked)
  const excludedProductIds = useMemo(() => {
    const likedIds = likedProducts.map(p => p.id);
    const dislikedIds = dislikedProducts.map(p => p.id);
    return new Set([...likedIds, ...dislikedIds]);
  }, [likedProducts, dislikedProducts]);

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

  // Filter out excluded products after fetching
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => !excludedProductIds.has(product.id));
  }, [products, excludedProductIds]);

  // Handle product fetching and exclusion
  useEffect(() => {
    if (filteredProducts?.length) {
      setAllProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newProducts = filteredProducts.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
    }
  }, [filteredProducts]);

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

  const handleLike = useCallback((productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      setLikedProducts(prev => {
        // Check if product is already liked to avoid duplicates
        if (prev.some(p => p.id === productId)) return prev;
        return [...prev, product];
      });
    }
  }, [allProducts]);

// Handle product dislikes
const handleDislike = useCallback((productId: string) => {
  const product = allProducts.find(p => p.id === productId);
  if (product) {
    setDislikedProducts(prev => [...prev, product]);
  }
}, [allProducts]);

  // Filter products for swiping (exclude already interacted with)
  const swipingProducts = useMemo(() => {
    return allProducts.filter(p => !excludedProductIds.has(p.id));
  }, [allProducts, excludedProductIds]);

  const renderContent = () => {
    switch (currentTab) {
      case 'popular':
        return <PopularTab />;
        
      case 'notInterested':
        return <DislikeTab dislikedProducts={dislikedProducts} />;
      
      case 'swiping':
        return (
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold text-white text-center">Swibee: Swipe with Vibe</h2>
            <p className="text-white/70 mb-4 text-center">
                Swipe. Shop. Smile.
            </p>
            
            <SwipeTab 
              products={swipingProducts}
              loading={loading && allProducts.length === 0}
              error={error}
              onSwipeLeft={handleDislike}
              onSwipeRight={handleLike}
              onEndReached={loadMoreProducts}
              isLoadingMore={isLoadingMore}
            />
          </div>
        );
      
      case 'liked':
        return <LikeTab likedProducts={likedProducts} />;
      
      case 'profile':
        return <ProfileTab />;
      
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