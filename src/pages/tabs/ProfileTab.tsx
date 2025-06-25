import { useState, useEffect } from 'react';
import { useAsyncStorage, useCurrentUser } from '@shopify/shop-minis-react';
import { useClearProfileStorage } from '../../hooks/clearProfileData';

const CATEGORY_OPTIONS = [
  { name: "Clothing", icon: "👕" },
  { name: "Electronics", icon: "💻" },
  { name: "Beauty", icon: "💅" },
  { name: "Accessories", icon: "🕶️" },
  { name: "Home", icon: "🏠" },
  { name: "Baby & Toddler", icon: "🍼" },
  { name: "Food & Drink", icon: "🍔" },
  { name: "Fitness & Nutrition", icon: "💪" },
  { name: "Toys & Games", icon: "🧸" },
  { name: "Art & Crafts", icon: "🎨" },
  { name: "Luggage & Bags", icon: "🧳" },
  { name: "Sporting Goods", icon: "⚽" },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', icon: '👨' },
  { value: 'Female', label: 'Female', icon: '👩' },
  { value: 'Other', label: 'Other', icon: '🎭' }
];

export function ProfileTab() {
  const { setItem, getItem } = useAsyncStorage();
  const { clearProfileData } = useClearProfileStorage();
  const { currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const [gender, setGender] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const g = await getItem({ key: 'gender' });
        const c = await getItem({ key: 'categories' });
        setGender(g ?? '');
        setCategories(c ? JSON.parse(c) : []);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setItem({ key: 'gender', value: gender });
      await setItem({ key: 'categories', value: JSON.stringify(categories) });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="px-4 pt-4 pb-20">
      {/* User Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold shrink-0">
          {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {currentUser?.displayName || 'Shop User'}
          </h2>
          <p className="text-white/70">Your Profile</p>
        </div>
      </div>

      {userLoading && (
        <div className="text-center py-8">
          <p className="text-white/80">Loading user data...</p>
        </div>
      )}

      {userError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-300">Error loading user: {userError.message}</p>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6">
          {/* Gender Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <label className="block text-sm font-semibold text-white mb-4">
              What's your gender?
            </label>
            <div className="space-y-3">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGender(option.value)}
                  className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    gender === option.value
                      ? 'border-white bg-highlight text-white'
                      : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                  }`}
                >
                  <span className="text-xl mr-3">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                  {gender === option.value && (
                    <span className="ml-auto bg-highlight rounded-full p-1">
                      <svg className="w-5 h-5 text-white border-2 border-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <label className="block text-sm font-semibold text-white mb-4">
              What interests you? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category.name}
                  onClick={() => toggleCategory(category.name)}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 flex items-center ${
                    categories.includes(category.name)
                      ? 'border-white bg-highlight text-white shadow-[0_0_0_4px_rgba(102,68,243,0.5)]'
                      : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                  }`}
                >
                  <span className="text-xl mr-2 flex-shrink-0">{category.icon}</span>
                  <span className="text-xs font-medium text-left flex-grow">{category.name}</span>
                  {categories.includes(category.name) && (
                    <div className="absolute -top-2 -right-2 bg-highlight rounded-full p-1 shadow-md z-10">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 px-6 rounded-2xl font-medium border border-white/30 bg-transparent text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!gender || categories.length === 0 || isSaving}
              className={`flex-1 py-3 px-6 rounded-2xl font-medium transition-all duration-200 ${
                gender && categories.length > 0 && !isSaving
                  ? 'bg-highlight text-white shadow-lg hover:shadow-xl hover:bg-highlight/90'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Info Display */}
          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Gender</h3>
            <div className="flex items-center gap-3">
              {gender ? (
                <>
                  <span className="text-xl">
                    {GENDER_OPTIONS.find(g => g.value === gender)?.icon}
                  </span>
                  <p className="text-white/80">{gender}</p>
                </>
              ) : (
                <p className="text-white/50">Not specified</p>
              )}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Interests</h3>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const categoryInfo = CATEGORY_OPTIONS.find(c => c.name === category);
                  return (
                    <div
                      key={category}
                      className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5"
                    >
                      {categoryInfo?.icon && (
                        <span className="text-sm">{categoryInfo.icon}</span>
                      )}
                      <span className="text-xs text-white/90">{category}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/50">No interests selected</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-3 px-6 rounded-2xl font-medium border border-white/30 bg-transparent text-white hover:bg-white/10 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={clearProfileData}
              className="flex-1 py-3 px-6 rounded-2xl font-medium bg-red-500/50 border border-red-500 text-white hover:bg-red-500/30 transition-colors"
            >
              Delete Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}